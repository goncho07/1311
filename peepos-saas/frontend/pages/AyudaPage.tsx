import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Phone, Mail, Building } from 'lucide-react';
import { track } from '@/analytics/track';

// New Architecture Components
import { ModulePage } from '@/layouts/ModulePage';
import Card from '@/ui/Card';
import FilterBar from '@/ui/FilterBar';
import Button from '@/ui/Button';

const faqData = {
  'Primeros Pasos': [
      { q: '¿Cómo restauro mi contraseña?', a: 'Para restaurar su contraseña, diríjase a la pantalla de inicio de sesión y haga clic en el enlace "¿Olvidó su contraseña?". Se le pedirá que ingrese su DNI y se le enviarán instrucciones a su correo electrónico registrado.' },
      { q: '¿Cómo actualizo mis datos de contacto?', a: 'Puede actualizar su información de contacto (correo electrónico, número de teléfono) desde la sección "Perfil" en el menú de usuario, ubicado en la esquina superior derecha.' },
      { q: '¿Qué navegadores son compatibles?', a: 'El sistema es compatible con las últimas versiones de Google Chrome, Mozilla Firefox, Safari y Microsoft Edge. Para una experiencia óptima, recomendamos usar Google Chrome.' },
      { q: '¿La plataforma funciona en celulares?', a: 'Sí, el sistema está diseñado con un enfoque "mobile-first", lo que significa que es totalmente funcional y fácil de usar en cualquier dispositivo móvil, tableta o computadora.' },
  ],
  'Gestión de Asistencia': [
      { q: '¿Cómo se justifica una inasistencia?', a: 'El apoderado o el personal administrativo puede justificar una inasistencia desde el módulo de Asistencia. Busque al estudiante, seleccione la fecha y adjunte la documentación de sustento (por ejemplo, un certificado médico).' },
      { q: '¿Qué hago si el escáner QR no funciona?', a: 'Si el escáner QR no funciona, puede registrar la asistencia manualmente desde el módulo de Asistencia. Seleccione la sección y marque al estudiante como "Presente". Verifique también que la aplicación tenga permisos para usar la cámara.' },
      { q: '¿Se puede tomar asistencia sin internet?', a: 'Sí, la función de escaneo QR está diseñada para funcionar sin conexión a internet. Los registros se guardarán en el dispositivo y se sincronizarán automáticamente con el sistema una vez que se recupere la conexión.' },
  ],
};
type FaqCategory = keyof typeof faqData;

const AyudaPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('Primeros Pasos');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return faqData[activeCategory];
    track('help_search_used', { query: searchQuery });
    return Object.values(faqData)
      .flat()
      .filter((faq) => faq.q.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeCategory]);

  const currentCategoryLabel = searchQuery ? 'Resultados de la Búsqueda' : activeCategory;

  return (
    <ModulePage
      title="Centro de Ayuda"
      description="Encuentre respuestas a preguntas frecuentes, guías y recursos de soporte."
      icon={HelpCircle}
      filters={<FilterBar activeFilters={[]} onRemoveFilter={() => {}} onClearAll={() => {}} />}
      content={
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-2">
            <h2 className="px-3 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Categorías
            </h2>
            {Object.keys(faqData).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category && !searchQuery ? 'filled' : 'tonal'}
                onClick={() => setActiveCategory(category as FaqCategory)}
                aria-label={`Ver categoría ${category}`}
                className="w-full !justify-start !text-base !h-auto !py-2.5"
              >
                {category}
              </Button>
            ))}
            <Card className="mt-6 !p-0 overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Contacto de Soporte</h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Soporte Técnico</p>
                    <p className="text-slate-500 dark:text-slate-400">soporte.sge@ugel01.gob.pe</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">Mesa de Ayuda</p>
                    <p className="text-slate-500 dark:text-slate-400">(01) 719-5880</p>
                  </div>
                </div>
              </div>
            </Card>
          </aside>
          <main className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{currentCategoryLabel}</h2>
            <div className="space-y-3">
              {filteredFaqs.slice(0, 4).map((faq, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    className="w-full flex justify-between items-center p-4 text-left"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200">{faq.q}</span>
                    <motion.div animate={{ rotate: expandedQuestion === index ? 180 : 0 }}>
                      <ChevronDown className="text-slate-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedQuestion === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-4 pb-4 text-slate-600 dark:text-slate-300">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </main>
        </div>
      }
    />
  );
};

export default AyudaPage;