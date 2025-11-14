import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Activity, ArrowRight, Save, Image as ImageIcon, Briefcase, Palette, Type, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { ModulePage } from '@/layouts/ModulePage';
import Card from '@/ui/Card';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import Select from '@/ui/Select';
import { toast } from 'react-hot-toast';

const moduleCards = [
  {
    title: 'Roles y Permisos',
    description: 'Cree y gestione roles de usuario para controlar el acceso a los módulos.',
    icon: Shield,
    path: '/settings/roles',
  },
  {
    title: 'Registro de Actividad',
    description: 'Audite todas las acciones importantes realizadas en el sistema.',
    icon: Activity,
    path: '/settings/activity-log',
  },
  {
    title: 'Parámetros Institucionales',
    description: 'Configure datos del colegio, periodos académicos y otra información clave.',
    icon: Briefcase,
    path: '/admin', // Assuming this is where it is managed
  },
];

const InterfaceTypographyCard: React.FC = () => {
    const { uiFontFamily, setUiFontFamily } = useSettingsStore();
    const [previewFont, setPreviewFont] = useState(uiFontFamily);

    const fontOptions = ['System Default', 'Poppins', 'Inter', 'Roboto', 'Nunito Sans'];
    const fontMap: { [key: string]: string } = {
        'System Default': "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
        'Poppins': "'Poppins', sans-serif",
        'Inter': "'Inter', sans-serif",
        'Roboto': "'Roboto', sans-serif",
        'Nunito Sans': "'Nunito Sans', sans-serif",
    };

    useEffect(() => {
        const fontFamily = fontMap[previewFont] || fontMap['Poppins'];
        document.documentElement.style.setProperty('--font-family', fontFamily);
        document.body.dataset.font = previewFont;
    }, [previewFont]);
    
    useEffect(() => {
        // When the saved font changes (e.g., on reset), update the preview
        setPreviewFont(uiFontFamily);
    }, [uiFontFamily]);


    const handleSave = () => {
        setUiFontFamily(previewFont);
        toast.success("Cambios guardados");
    };

    const handleReset = () => {
        setUiFontFamily('System Default'); 
    };

    // On component unmount, if changes are not saved, revert to the stored font
    useEffect(() => {
        return () => {
            const savedFontFamily = fontMap[uiFontFamily] || fontMap['Poppins'];
            document.documentElement.style.setProperty('--font-family', savedFontFamily);
            document.body.dataset.font = uiFontFamily;
        }
    }, [uiFontFamily]);

    const hasChanges = previewFont !== uiFontFamily;

    return (
        <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Type/> Tipografía de la Interfaz</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Seleccione la fuente para la interfaz de la aplicación. El cambio se previsualizará en tiempo real.
            </p>
            <Select 
                label="Fuente de la Interfaz"
                id="ui-font-family"
                value={previewFont} 
                onChange={(e) => setPreviewFont(e.target.value)}
                aria-label="Seleccionar fuente de la interfaz"
            >
                {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
            </Select>
            <AnimatePresence>
                {hasChanges && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-4"
                    >
                        <Button onClick={handleSave} icon={Save} aria-label="Guardar cambios de fuente">Guardar cambios</Button>
                        <Button onClick={handleReset} variant="tonal" icon={RefreshCw} aria-label="Restablecer fuente">Restablecer</Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

const TypographyCustomization: React.FC = () => {
    const { carnetFontFamily, setCarnetFontFamily } = useSettingsStore();
    const [carnetFont, setCarnetFont] = useState(carnetFontFamily);

    const handleSave = () => {
        setCarnetFontFamily(carnetFont);
        toast.success("Configuración de tipografía guardada.");
    };
    
    return (
        <Card>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Type/> Tipografía de Carnets</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Define la familia de fuentes para los carnets. Asegúrese de que las fuentes de Google Fonts estén importadas.
            </p>
            <div className="space-y-4">
                <Input
                    label="Fuente de Carnets"
                    id="carnet-font"
                    type="text"
                    value={carnetFont}
                    onChange={(e) => setCarnetFont(e.target.value)}
                    placeholder="Ej: Chau Philomene One"
                    // FIX: Added missing aria-label prop
                    aria-label="Fuente de Carnets"
                />
                 <Button variant="filled" icon={Save} onClick={handleSave} aria-label="Guardar Configuración de Tipografía">
                    Guardar
                </Button>
            </div>
        </Card>
    );
};


const CarnetCustomization: React.FC = () => {
    const {
        carnetPatternUrl,
        setCarnetPatternUrl,
        carnetHeaderGradientInicial,
        carnetHeaderGradientPrimaria,
        carnetHeaderGradientSecundaria,
        setCarnetHeaderGradient,
    } = useSettingsStore();

    const [patternUrl, setPatternUrl] = useState(carnetPatternUrl);
    const [inicialFrom, setInicialFrom] = useState(carnetHeaderGradientInicial.from);
    const [inicialTo, setInicialTo] = useState(carnetHeaderGradientInicial.to);
    const [primariaFrom, setPrimariaFrom] = useState(carnetHeaderGradientPrimaria.from);
    const [primariaTo, setPrimariaTo] = useState(carnetHeaderGradientPrimaria.to);
    const [secundariaFrom, setSecundariaFrom] = useState(carnetHeaderGradientSecundaria.from);
    const [secundariaTo, setSecundariaTo] = useState(carnetHeaderGradientSecundaria.to);

    const handleSave = () => {
        setCarnetPatternUrl(patternUrl);
        setCarnetHeaderGradient('Inicial', { from: inicialFrom, to: inicialTo });
        setCarnetHeaderGradient('Primaria', { from: primariaFrom, to: primariaTo });
        setCarnetHeaderGradient('Secundaria', { from: secundariaFrom, to: secundariaTo });
        toast.success("Configuración de carnets guardada.");
    };

    return (
      <Card>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Palette/> Personalización de Carnets</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Configure los elementos visuales de los carnets de estudiante.
        </p>
        <div className="space-y-4">
            <Input
                label="URL del Patrón de Fondo"
                id="carnet-pattern-url"
                type="text"
                value={patternUrl}
                onChange={(e) => setPatternUrl(e.target.value)}
                placeholder="https://example.com/pattern.png"
                // FIX: Added missing aria-label prop
                aria-label="URL del Patrón de Fondo"
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FIX: Added missing aria-label props to color inputs */}
                <Input label="Gradiente Inicial (Desde)" type="color" value={inicialFrom} onChange={e => setInicialFrom(e.target.value)} aria-label="Gradiente Inicial (Desde)" />
                <Input label="Gradiente Inicial (Hasta)" type="color" value={inicialTo} onChange={e => setInicialTo(e.target.value)} aria-label="Gradiente Inicial (Hasta)" />
                <Input label="Gradiente Primaria (Desde)" type="color" value={primariaFrom} onChange={e => setPrimariaFrom(e.target.value)} aria-label="Gradiente Primaria (Desde)" />
                <Input label="Gradiente Primaria (Hasta)" type="color" value={primariaTo} onChange={e => setPrimariaTo(e.target.value)} aria-label="Gradiente Primaria (Hasta)" />
                <Input label="Gradiente Secundaria (Desde)" type="color" value={secundariaFrom} onChange={e => setSecundariaFrom(e.target.value)} aria-label="Gradiente Secundaria (Desde)" />
                <Input label="Gradiente Secundaria (Hasta)" type="color" value={secundariaTo} onChange={e => setSecundariaTo(e.target.value)} aria-label="Gradiente Secundaria (Hasta)" />
            </div>
             <Button variant="filled" icon={Save} onClick={handleSave} aria-label="Guardar Configuración de Carnets">
                Guardar
            </Button>
        </div>
      </Card>
    )
}

const BrandCustomizationContent: React.FC = () => {
  const { 
    loginImageUrl, setLoginImageUrl,
    loginLogoUrl, setLoginLogoUrl, 
    sidebarLogoUrl, setSidebarLogoUrl 
  } = useSettingsStore();

  const [newLoginImageUrl, setNewLoginImageUrl] = useState(loginImageUrl);
  const [newLoginLogoUrl, setNewLoginLogoUrl] = useState(loginLogoUrl);
  const [newSidebarLogoUrl, setNewSidebarLogoUrl] = useState(sidebarLogoUrl);

  const handleSaveLoginImage = () => {
    setLoginImageUrl(newLoginImageUrl);
    toast.success("Imagen de fondo guardada.");
  }
  
  const handleSaveLoginLogo = () => {
    setLoginLogoUrl(newLoginLogoUrl);
    toast.success("Logo de login guardado.");
  }
  
  const handleSaveSidebarLogo = () => {
    setSidebarLogoUrl(newSidebarLogoUrl);
    toast.success("Logo de barra lateral guardado.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <InterfaceTypographyCard />
      </div>
      <Card className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Imagen de Fondo (Login)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 flex-grow">
          URL de la imagen de fondo de la pantalla de inicio de sesión.
        </p>
        <div className="space-y-4">
          <Input
            label="URL de la Imagen"
            id="login-image-url"
            type="text"
            value={newLoginImageUrl}
            onChange={(e) => setNewLoginImageUrl(e.target.value)}
            aria-label="URL de la imagen de fondo del login"
            placeholder="https://example.com/background.png"
          />
          <div className="flex justify-center items-center p-4 h-32 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <img
              src={newLoginImageUrl || 'https://via.placeholder.com/200x100/slate/white?text=No+Imagen'}
              alt="Vista previa"
              className="max-w-full max-h-24 h-auto object-cover"
              onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/200x100/rose/white?text=Error'; }}
            />
          </div>
          <Button variant="filled" icon={Save} onClick={handleSaveLoginImage} aria-label="Guardar Imagen de Fondo" className="w-full">
            Guardar
          </Button>
        </div>
      </Card>
      <Card className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Logo (Login)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 flex-grow">
          Logo que aparece sobre el formulario de inicio de sesión.
        </p>
        <div className="space-y-4">
          <Input
            label="URL del Logo"
            id="login-logo-url"
            type="text"
            value={newLoginLogoUrl}
            onChange={(e) => setNewLoginLogoUrl(e.target.value)}
            aria-label="URL del logo del login"
            placeholder="https://example.com/logo.png"
          />
          <div className="flex justify-center items-center p-4 h-32 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <img
              src={newLoginLogoUrl || 'https://via.placeholder.com/200x50/slate/white?text=No+Logo'}
              alt="Vista previa"
              className="max-w-48 max-h-24 h-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/200x50/rose/white?text=Error';
              }}
            />
          </div>
          <Button variant="filled" icon={Save} onClick={handleSaveLoginLogo} aria-label="Guardar Logo de Login" className="w-full">
            Guardar
          </Button>
        </div>
      </Card>
      <div className="lg:col-span-2">
      <Card className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Logo (Barra Lateral y Carnets)</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4 flex-grow">
          Logo para la barra de navegación y los carnets de estudiante.
        </p>
        <div className="space-y-4">
          <Input
            label="URL del Logo"
            id="sidebar-logo-url"
            type="text"
            value={newSidebarLogoUrl}
            onChange={(e) => setNewSidebarLogoUrl(e.target.value)}
            aria-label="URL del logo de la barra lateral"
            placeholder="https://example.com/sidebar-logo.png"
          />
          <div className="flex justify-center items-center p-4 h-32 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <img
              src={newSidebarLogoUrl || 'https://via.placeholder.com/100x100/slate/white?text=No+Logo'}
              alt="Vista previa"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/100x100/rose/white?text=Error';
              }}
            />
          </div>
          <Button variant="filled" icon={Save} onClick={handleSaveSidebarLogo} aria-label="Guardar Logo de Barra Lateral" className="w-full">
            Guardar
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
};

const CarnetSettingsContent: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CarnetCustomization />
            <TypographyCustomization />
        </div>
    );
};

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('modulos');

  const tabs = [
    { id: 'modulos', label: 'Módulos' },
    { id: 'personalizacion', label: 'Personalización de Marca' },
    { id: 'carnets', label: 'Personalización de Carnets' },
  ];

  return (
    <ModulePage
      title="Configuración del Sistema"
      description="Ajuste los parámetros del sistema, gestione la seguridad y personalice la apariencia."
      icon={Settings}
      filters={
        <nav className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="text"
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Ver pestaña ${tab.label}`}
              className={`!rounded-b-none !border-b-2 ${
                activeTab === tab.id
                  ? '!border-indigo-600 !text-indigo-600 dark:!text-indigo-400'
                  : 'border-transparent text-slate-500 hover:!text-slate-800 dark:hover:!text-slate-200'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      }
      content={
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'modulos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moduleCards.map((card) => (
                    <Card
                      key={card.path}
                      onClick={() => navigate(card.path)}
                      className="h-full flex flex-col justify-between group"
                    >
                      <div>
                        <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-xl w-fit mb-4">
                          <card.icon size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{card.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{card.description}</p>
                      </div>
                      <div className="flex items-center justify-end text-indigo-600 dark:text-indigo-400 font-semibold mt-4">
                        <span>Ir al módulo</span>
                        <ArrowRight size={18} className="ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {activeTab === 'personalizacion' && <BrandCustomizationContent />}
              {activeTab === 'carnets' && <CarnetSettingsContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      }
    />
  );
};

export default SettingsPage;