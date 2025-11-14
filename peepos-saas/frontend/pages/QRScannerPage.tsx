import React, { useState, useEffect, useMemo } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  List,
  CameraOff,
  QrCode,
  User,
  GraduationCap,
  Shield,
  Loader2,
} from 'lucide-react';
import { AttendanceRecord, Student, Staff, GenericUser } from '@/types';
import Select from '@/ui/Select';
import Button from '@/ui/Button';
import { isStudent, isStaff, getRoleDisplay, formatUserName } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import * as api from '@/services/api';
import { format } from 'date-fns/format';

const UserCarnet: React.FC<{ user: GenericUser; time: string }> = ({ user, time }) => {
  const name = isStudent(user) ? user.fullName : user.name;
  const role = getRoleDisplay(user);
  const dni = isStudent(user) ? user.documentNumber : user.dni;
  const gradeInfo = isStudent(user) ? `${user.grade} "${user.section}"` : null;

  let RoleIcon: React.ElementType;
  if (isStudent(user)) RoleIcon = User;
  else if (isStaff(user) && user.category === 'Docente') RoleIcon = GraduationCap;
  else RoleIcon = Shield;

  return (
    <motion.div
      layoutId={`carnet-${dni}`}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/30 p-4 m-4 rounded-[var(--radius-lg)] shadow-2xl shadow-emerald-500/10 text-center"
    >
      <div className="flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400 font-bold text-base">
        <CheckCircle size={20} />
        <p>Asistió Correctamente</p>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Marcado a las {time}</p>

      <img
        src={user.avatarUrl}
        alt={name}
        className="w-24 h-24 rounded-full mx-auto my-2 border-4 border-slate-100 dark:border-slate-700 shadow-md"
      />
      <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">{formatUserName(name)}</h3>

      <div className="mt-3 space-y-1.5 text-left">
        <div className="flex items-center gap-2 p-2 text-sm bg-slate-100 dark:bg-slate-700/50 rounded-lg">
          <RoleIcon size={18} className="text-indigo-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{role}</span>
        </div>
        {gradeInfo && (
          <div className="flex items-center gap-2 p-2 text-sm bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <GraduationCap size={18} className="text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">{gradeInfo}</span>
          </div>
        )}
        <div className="flex items-center gap-2 p-2 text-sm bg-slate-100 dark:bg-slate-700/50 rounded-lg">
          <QrCode size={18} className="text-indigo-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">DNI: {dni}</span>
        </div>
      </div>
    </motion.div>
  );
};

const QRScannerPage: React.FC = () => {
  const [allUsersMap, setAllUsersMap] = useState<Map<string, GenericUser>>(new Map());
  const [isUserMapLoading, setIsUserMapLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<{ user: GenericUser; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);
  
  useEffect(() => {
    setIsUserMapLoading(true);
    Promise.all([
        api.getUsers(),
        api.getAttendanceForToday()
    ]).then(([users, records]) => {
        const usersMap = new Map<string, GenericUser>();
        users.forEach(user => {
            const userId = isStudent(user) ? user.documentNumber : user.dni;
            usersMap.set(userId, user);
        });
        setAllUsersMap(usersMap);
        setAttendanceList(records as AttendanceRecord[]);
        setIsUserMapLoading(false);
    }).catch(err => {
        console.error("Failed to load initial data:", err);
        setError("No se pudieron cargar los datos de los usuarios.");
        setIsUserMapLoading(false);
    });
  }, []);
  
  useEffect(() => {
    // Request camera permission and enumerate devices on mount
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => navigator.mediaDevices.enumerateDevices())
      .then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === 'videoinput');
        if (videoDevices.length > 0) {
          setVideoInputDevices(videoDevices);
          setSelectedDeviceId(videoDevices[0].deviceId);
          setIsCameraReady(true);
        } else {
          setError('No se encontraron cámaras disponibles.');
          setIsCameraReady(false);
        }
      })
      .catch((err) => {
        setError('No se pudo acceder a la cámara. Por favor, permita el acceso a la cámara en su navegador.');
        console.error(err);
        setIsCameraReady(false);
      });
  }, []); // Run only on mount

  useEffect(() => {
    // Effect to manage the scanning lifecycle
    if (isScanning && selectedDeviceId) {
      codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', (result, err) => {
        if (result) {
          setScanResult(result.getText());
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
          // Don't set a user-facing error for minor scan issues to allow scanner to continue
        }
      }).catch((err) => {
        console.error('Error starting video stream:', err);
        setError('No se pudo iniciar la cámara seleccionada. Verifique que no esté en uso por otra aplicación.');
        setIsScanning(false);
      });
    }
    
    // Cleanup function to reset the scanner when scanning stops or device changes
    return () => {
      codeReader.reset();
    };
  }, [isScanning, selectedDeviceId, codeReader]);


  useEffect(() => {
    if (scanResult) {
      if (isUserMapLoading) {
        setError('Base de datos de usuarios aún cargando. Intente de nuevo en segundos.');
        return;
      }
      
      const user: GenericUser | undefined = allUsersMap.get(scanResult);
      const now = new Date();
      if (user) {
        const id = isStudent(user) ? user.documentNumber : user.dni;
        const name = isStudent(user) ? user.fullName : user.name;
        const alreadyExists = attendanceList.some((record) => record.studentId === id);
        if (!alreadyExists) {
          const newRecord: AttendanceRecord = {
            studentId: id,
            studentName: name,
            timestamp: now.toISOString(),
            status: now.getHours() > 8 ? 'tarde' : 'presente',
            synced: true, // Assume synced with simulated API
          };
          
          api.recordAttendance(newRecord).then(() => {
              setAttendanceList(prev => [newRecord, ...prev]);
              setLastScanned({ user: user, time: now.toLocaleTimeString('es-PE') });
              setError(null);
              if (isStudent(user)) {
                 toast.success(`Aviso de entrada para ${formatUserName(name)} encolado.`, { icon: '📲' });
              }
          }).catch(err => {
              console.error("Error writing attendance:", err);
              setError("Error al guardar asistencia.");
          });

        } else {
          setError(`El usuario ${formatUserName(name)} ya fue registrado.`);
          setLastScanned(null);
        }
      } else {
        setError(`Código QR no válido o usuario no encontrado.`);
        setLastScanned(null);
      }
      const timer = setTimeout(() => {
        setScanResult(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult, allUsersMap, attendanceList, isUserMapLoading]);
  
  const handleStartScan = () => {
    setLastScanned(null);
    setError(null);
    setIsScanning(true);
  };
  
  const handleStopScan = () => {
    setIsScanning(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[calc(100vh-124px)]">
      <div className="lg:col-span-2 flex flex-col bg-slate-900 rounded-[var(--radius-lg)] shadow-2xl overflow-hidden">
        <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
          <video id="video" className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} />
          {!isScanning && (
            <div className="text-center text-white p-8">
              {isCameraReady ? (
                <>
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-bold mb-2">Listo para escanear</h2>
                  <p className="text-slate-400 mb-6">
                    {isUserMapLoading ? 'Cargando base de datos de usuarios...' : 'Presione "Iniciar Escaneo" para activar la cámara.'}
                  </p>
                  <Button onClick={handleStartScan} icon={isUserMapLoading ? () => <Loader2 className="animate-spin"/> : Camera} aria-label="Iniciar Escaneo" disabled={!isCameraReady || isUserMapLoading}>
                    {isUserMapLoading ? 'Cargando...' : 'Iniciar Escaneo'}
                  </Button>
                </>
              ) : (
                <>
                  <CameraOff size={64} className="mx-auto mb-4 text-rose-400" />
                  <h2 className="text-2xl font-bold mb-2 text-rose-300">Cámara no disponible</h2>
                  <p className="text-slate-400">{error}</p>
                </>
              )}
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 max-w-sm h-auto aspect-square border-4 border-white/50 rounded-[var(--radius-lg)] shadow-lg animate-pulse"></div>
            </div>
          )}
        </div>
        {isScanning && (
          <div className="p-3 bg-slate-800/50 flex items-center justify-between">
            <Select
              aria-label="Seleccionar dispositivo de cámara"
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="!text-sm !h-10"
              disabled={videoInputDevices.length <= 1}
            >
              {videoInputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Cámara ${videoInputDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </Select>
            <Button onClick={handleStopScan} variant="danger" aria-label="Detener escaneo">
              Detener
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-[var(--radius-lg)] shadow-lg border border-gray-100 dark:border-slate-700">
        <div className="p-5 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <List size={22} /> Lista de Asistencia
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Turno Mañana - {new Date().toLocaleDateString('es-PE')}
          </p>
        </div>
        <div className="p-2 flex-grow overflow-hidden">
          <AnimatePresence>
            {lastScanned && <UserCarnet user={lastScanned.user} time={lastScanned.time} />}
            {error && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 m-4 rounded-[var(--radius-md)] text-center"
              >
                <XCircle className="mx-auto text-rose-500" size={40} />
                <p className="font-bold text-rose-800 dark:text-rose-300 mt-3">Error de Escaneo</p>
                <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="px-4 py-2 bg-gray-100 dark:bg-slate-700/50 rounded-t-lg sticky top-0">
            <h3 className="text-base font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Users size={18} /> Registrados ({attendanceList.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-slate-700 p-2">
            {attendanceList.slice(0, 5).map((record) => (
              <motion.li
                key={record.studentId}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-2.5"
              >
                <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{formatUserName(record.studentName)}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{new Date(record.timestamp).toLocaleTimeString('es-PE')}</span>
                  {record.synced ? (
                    <span title="Sincronizado">
                      <CheckCircle size={16} className="text-emerald-500" />
                    </span>
                  ) : (
                    <span title="Pendiente de Sincronización">
                      <AlertTriangle size={16} className="text-amber-500" />
                    </span>
                  )}
                </div>
              </motion.li>
            ))}
            {attendanceList.length === 0 && !lastScanned && !error && (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>Esperando escaneos...</p>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;
