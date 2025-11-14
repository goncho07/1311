<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Role;
use App\Models\Permiso;
use App\Models\PeriodoAcademico;
use App\Models\AreaCurricular;
use App\Models\CompetenciaMinedu;
use App\Models\ConfiguracionInstitucional;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        // ════════════════════════════════════════════════════
        // 1. ROLES Y PERMISOS
        // ════════════════════════════════════════════════════

        $this->command->info('🔹 Creando roles...');

        $roles = [
            ['nombre' => 'Director', 'slug' => 'director', 'nivel_jerarquia' => 10],
            ['nombre' => 'Subdirector', 'slug' => 'subdirector', 'nivel_jerarquia' => 9],
            ['nombre' => 'Coordinador', 'slug' => 'coordinador', 'nivel_jerarquia' => 8],
            ['nombre' => 'Docente', 'slug' => 'docente', 'nivel_jerarquia' => 5],
            ['nombre' => 'Tutor', 'slug' => 'tutor', 'nivel_jerarquia' => 5],
            ['nombre' => 'Administrativo', 'slug' => 'administrativo', 'nivel_jerarquia' => 4],
            ['nombre' => 'Apoderado', 'slug' => 'apoderado', 'nivel_jerarquia' => 2],
            ['nombre' => 'Estudiante', 'slug' => 'estudiante', 'nivel_jerarquia' => 1],
        ];

        foreach ($roles as $roleData) {
            Role::create($roleData);
        }

        // ════════════════════════════════════════════════════
        // 2. PERÍODO ACADÉMICO 2025
        // ════════════════════════════════════════════════════

        $this->command->info('🔹 Creando período académico 2025...');

        PeriodoAcademico::create([
            'año' => 2025,
            'nombre' => 'Año Lectivo 2025',
            'fecha_inicio' => '2025-03-11',
            'fecha_fin' => '2025-12-20',
            'activo' => true,
            'configuracion' => [
                'bimestre_1' => ['inicio' => '2025-03-11', 'fin' => '2025-05-17'],
                'bimestre_2' => ['inicio' => '2025-05-20', 'fin' => '2025-07-26'],
                'vacaciones' => ['inicio' => '2025-07-29', 'fin' => '2025-08-09'],
                'bimestre_3' => ['inicio' => '2025-08-12', 'fin' => '2025-10-18'],
                'bimestre_4' => ['inicio' => '2025-10-21', 'fin' => '2025-12-20'],
            ]
        ]);

        // ════════════════════════════════════════════════════
        // 3. ÁREAS CURRICULARES SEGÚN MINEDU
        // ════════════════════════════════════════════════════

        $this->command->info('🔹 Creando áreas curriculares...');

        $areas = [
            ['codigo_minedu' => 'MAT', 'nombre' => 'Matemática', 'horas' => 6, 'color' => '#3B82F6'],
            ['codigo_minedu' => 'COM', 'nombre' => 'Comunicación', 'horas' => 5, 'color' => '#EF4444'],
            ['codigo_minedu' => 'ING', 'nombre' => 'Inglés', 'horas' => 2, 'color' => '#10B981'],
            ['codigo_minedu' => 'ART', 'nombre' => 'Arte y Cultura', 'horas' => 2, 'color' => '#F59E0B'],
            ['codigo_minedu' => 'CCS', 'nombre' => 'Ciencias Sociales', 'horas' => 3, 'color' => '#8B5CF6'],
            ['codigo_minedu' => 'DPCC', 'nombre' => 'Desarrollo Personal, Ciudadanía y Cívica', 'horas' => 3, 'color' => '#EC4899'],
            ['codigo_minedu' => 'EDF', 'nombre' => 'Educación Física', 'horas' => 2, 'color' => '#14B8A6'],
            ['codigo_minedu' => 'EDR', 'nombre' => 'Educación Religiosa', 'horas' => 2, 'color' => '#A855F7'],
            ['codigo_minedu' => 'CYT', 'nombre' => 'Ciencia y Tecnología', 'horas' => 3, 'color' => '#06B6D4'],
            ['codigo_minedu' => 'EPT', 'nombre' => 'Educación para el Trabajo', 'horas' => 2, 'color' => '#F97316'],
        ];

        foreach ($areas as $area) {
            AreaCurricular::create([
                'codigo_minedu' => $area['codigo_minedu'],
                'nombre' => $area['nombre'],
                'horas_semanales_1' => $area['horas'],
                'horas_semanales_2' => $area['horas'],
                'horas_semanales_3' => $area['horas'],
                'horas_semanales_4' => $area['horas'],
                'horas_semanales_5' => $area['horas'],
                'color_identificacion' => $area['color'],
                'activo' => true
            ]);
        }

        // ════════════════════════════════════════════════════
        // 4. COMPETENCIAS SEGÚN CNEB (31 competencias)
        // ════════════════════════════════════════════════════

        $this->command->info('🔹 Creando competencias del CNEB...');

        // Matemática (4 competencias)
        $matematica = AreaCurricular::where('codigo_minedu', 'MAT')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 23,
            'area_curricular_id' => $matematica->id,
            'nombre' => 'Resuelve problemas de cantidad',
            'descripcion' => 'Resuelve problemas referidos a acciones de agregar, quitar, igualar, repetir, repartir cantidades y combinar colecciones',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 24,
            'area_curricular_id' => $matematica->id,
            'nombre' => 'Resuelve problemas de regularidad, equivalencia y cambio',
            'descripcion' => 'Resuelve problemas referidos a encontrar patrones, establecer equivalencias y relaciones de cambio',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 25,
            'area_curricular_id' => $matematica->id,
            'nombre' => 'Resuelve problemas de forma, movimiento y localización',
            'descripcion' => 'Resuelve problemas relacionados con formas, ubicaciones y transformaciones de objetos',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 26,
            'area_curricular_id' => $matematica->id,
            'nombre' => 'Resuelve problemas de gestión de datos e incertidumbre',
            'descripcion' => 'Resuelve problemas relacionados con la recopilación, organización y análisis de datos',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Comunicación (3 competencias)
        $comunicacion = AreaCurricular::where('codigo_minedu', 'COM')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 1,
            'area_curricular_id' => $comunicacion->id,
            'nombre' => 'Se comunica oralmente en su lengua materna',
            'descripcion' => 'Se comunica oralmente mediante diversos tipos de textos; infiere el tema, propósito y hechos',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 2,
            'area_curricular_id' => $comunicacion->id,
            'nombre' => 'Lee diversos tipos de textos escritos en su lengua materna',
            'descripcion' => 'Lee diversos tipos de textos con estructuras complejas, vocabulario variado y especializado',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 3,
            'area_curricular_id' => $comunicacion->id,
            'nombre' => 'Escribe diversos tipos de textos en su lengua materna',
            'descripcion' => 'Escribe diversos tipos de textos de forma reflexiva adecuando su texto al destinatario',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Inglés (3 competencias)
        $ingles = AreaCurricular::where('codigo_minedu', 'ING')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 4,
            'area_curricular_id' => $ingles->id,
            'nombre' => 'Se comunica oralmente en inglés como lengua extranjera',
            'descripcion' => 'Se comunica oralmente mediante diversos tipos de textos en inglés',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 5,
            'area_curricular_id' => $ingles->id,
            'nombre' => 'Lee diversos tipos de textos escritos en inglés como lengua extranjera',
            'descripcion' => 'Lee diversos tipos de textos en inglés que presentan estructura simple',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 6,
            'area_curricular_id' => $ingles->id,
            'nombre' => 'Escribe diversos tipos de textos en inglés como lengua extranjera',
            'descripcion' => 'Escribe diversos tipos de textos de mediana extensión en inglés',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Arte y Cultura (2 competencias)
        $arte = AreaCurricular::where('codigo_minedu', 'ART')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 7,
            'area_curricular_id' => $arte->id,
            'nombre' => 'Aprecia de manera crítica manifestaciones artístico-culturales',
            'descripcion' => 'Aprecia de manera crítica manifestaciones artístico-culturales cuando describe sus características',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 8,
            'area_curricular_id' => $arte->id,
            'nombre' => 'Crea proyectos desde los lenguajes artísticos',
            'descripcion' => 'Crea proyectos artísticos que comunican de manera efectiva ideas y emociones',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Ciencias Sociales (3 competencias)
        $ccss = AreaCurricular::where('codigo_minedu', 'CCS')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 16,
            'area_curricular_id' => $ccss->id,
            'nombre' => 'Construye interpretaciones históricas',
            'descripcion' => 'Construye interpretaciones históricas sobre hechos o procesos del Perú y el mundo',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 17,
            'area_curricular_id' => $ccss->id,
            'nombre' => 'Gestiona responsablemente el espacio y el ambiente',
            'descripcion' => 'Gestiona responsablemente el espacio y ambiente al proponer alternativas para mejorar el ambiente',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 18,
            'area_curricular_id' => $ccss->id,
            'nombre' => 'Gestiona responsablemente los recursos económicos',
            'descripcion' => 'Gestiona responsablemente los recursos económicos al promover el ahorro y la inversión',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // DPCC (3 competencias)
        $dpcc = AreaCurricular::where('codigo_minedu', 'DPCC')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 13,
            'area_curricular_id' => $dpcc->id,
            'nombre' => 'Construye su identidad',
            'descripcion' => 'Construye su identidad al tomar conciencia de los aspectos que lo hacen único',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 14,
            'area_curricular_id' => $dpcc->id,
            'nombre' => 'Convive y participa democráticamente',
            'descripcion' => 'Convive y participa democráticamente cuando se relaciona con los demás respetando las diferencias',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Educación Física (2 competencias)
        $edf = AreaCurricular::where('codigo_minedu', 'EDF')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 9,
            'area_curricular_id' => $edf->id,
            'nombre' => 'Se desenvuelve de manera autónoma a través de su motricidad',
            'descripcion' => 'Se desenvuelve de manera autónoma a través de su motricidad cuando comprende cómo usar su cuerpo',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 10,
            'area_curricular_id' => $edf->id,
            'nombre' => 'Asume una vida saludable',
            'descripcion' => 'Asume una vida saludable cuando utiliza instrumentos que miden la aptitud física',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 11,
            'area_curricular_id' => $edf->id,
            'nombre' => 'Interactúa a través de sus habilidades sociomotrices',
            'descripcion' => 'Interactúa a través de sus habilidades sociomotrices al asumir distintos roles',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Educación Religiosa (2 competencias)
        $edr = AreaCurricular::where('codigo_minedu', 'EDR')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 12,
            'area_curricular_id' => $edr->id,
            'nombre' => 'Construye su identidad como persona humana, amada por Dios',
            'descripcion' => 'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 15,
            'area_curricular_id' => $edr->id,
            'nombre' => 'Asume la experiencia del encuentro personal y comunitario con Dios',
            'descripcion' => 'Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Ciencia y Tecnología (3 competencias)
        $cyt = AreaCurricular::where('codigo_minedu', 'CYT')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 19,
            'area_curricular_id' => $cyt->id,
            'nombre' => 'Indaga mediante métodos científicos',
            'descripcion' => 'Indaga mediante métodos científicos para construir sus conocimientos',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 20,
            'area_curricular_id' => $cyt->id,
            'nombre' => 'Explica el mundo físico basándose en conocimientos sobre los seres vivos',
            'descripcion' => 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 21,
            'area_curricular_id' => $cyt->id,
            'nombre' => 'Diseña y construye soluciones tecnológicas',
            'descripcion' => 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Educación para el Trabajo (3 competencias)
        $ept = AreaCurricular::where('codigo_minedu', 'EPT')->first();

        CompetenciaMinedu::create([
            'numero_competencia' => 27,
            'area_curricular_id' => $ept->id,
            'nombre' => 'Gestiona proyectos de emprendimiento económico o social',
            'descripcion' => 'Gestiona proyectos de emprendimiento económico o social cuando integra activamente información',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 28,
            'area_curricular_id' => $ept->id,
            'nombre' => 'Se desenvuelve en entornos virtuales generados por las TIC',
            'descripcion' => 'Se desenvuelve en los entornos virtuales cuando comprende los procedimientos e intercambios',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 29,
            'area_curricular_id' => $ept->id,
            'nombre' => 'Gestiona su aprendizaje de manera autónoma',
            'descripcion' => 'Gestiona su aprendizaje al darse cuenta de lo que debe aprender',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // Competencias transversales (2)
        CompetenciaMinedu::create([
            'numero_competencia' => 30,
            'area_curricular_id' => null,
            'nombre' => 'Se desenvuelve en entornos virtuales generados por las TIC',
            'descripcion' => 'Competencia transversal: Se desenvuelve en entornos virtuales',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        CompetenciaMinedu::create([
            'numero_competencia' => 31,
            'area_curricular_id' => null,
            'nombre' => 'Gestiona su aprendizaje de manera autónoma',
            'descripcion' => 'Competencia transversal: Gestiona su aprendizaje de manera autónoma',
            'ciclo_educativo' => 'VII',
            'activo' => true
        ]);

        // ════════════════════════════════════════════════════
        // 5. CONFIGURACIÓN INSTITUCIONAL
        // ════════════════════════════════════════════════════

        $this->command->info('🔹 Creando configuración institucional...');

        $configs = [
            ['categoria' => 'GENERAL', 'parametro' => 'nombre_sistema', 'valor' => 'Sistema Peepos', 'tipo_dato' => 'STRING'],
            ['categoria' => 'ACADEMICO', 'parametro' => 'nota_minima_aprobatoria', 'valor' => '11', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'ACADEMICO', 'parametro' => 'escala_vigesimal', 'valor' => 'true', 'tipo_dato' => 'BOOLEAN'],
            ['categoria' => 'ACADEMICO', 'parametro' => 'permite_notas_decimales', 'valor' => 'false', 'tipo_dato' => 'BOOLEAN'],
            ['categoria' => 'ASISTENCIA', 'parametro' => 'tolerancia_tardanza_minutos', 'valor' => '15', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'ASISTENCIA', 'parametro' => 'porcentaje_minimo_asistencia', 'valor' => '85', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'MATRICULA', 'parametro' => 'edad_minima_primer_grado', 'valor' => '12', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'MATRICULA', 'parametro' => 'edad_maxima_quinto_grado', 'valor' => '18', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'FINANZAS', 'parametro' => 'moneda', 'valor' => 'PEN', 'tipo_dato' => 'STRING'],
            ['categoria' => 'FINANZAS', 'parametro' => 'pension_mensual_defecto', 'valor' => '150.00', 'tipo_dato' => 'DECIMAL'],
            ['categoria' => 'NOTIFICACIONES', 'parametro' => 'notificar_apoderados_inasistencia', 'valor' => 'true', 'tipo_dato' => 'BOOLEAN'],
            ['categoria' => 'NOTIFICACIONES', 'parametro' => 'notificar_apoderados_notas_bajas', 'valor' => 'true', 'tipo_dato' => 'BOOLEAN'],
            ['categoria' => 'SEGURIDAD', 'parametro' => 'duracion_sesion_minutos', 'valor' => '480', 'tipo_dato' => 'INTEGER'],
            ['categoria' => 'SEGURIDAD', 'parametro' => 'requerir_cambio_password_inicial', 'valor' => 'true', 'tipo_dato' => 'BOOLEAN'],
        ];

        foreach ($configs as $config) {
            ConfiguracionInstitucional::create($config);
        }

        $this->command->info('✅ Seeder de tenant completado exitosamente');
    }
}
