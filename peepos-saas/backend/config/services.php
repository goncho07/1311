<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | Configuración de servicios externos
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Services
    |--------------------------------------------------------------------------
    */

    'google' => [
        'project_id' => env('GOOGLE_CLOUD_PROJECT_ID'),
        'key_file' => env('GOOGLE_CLOUD_KEY_FILE'),
        'storage_bucket' => env('GOOGLE_CLOUD_STORAGE_BUCKET'),
        'api_key' => env('GOOGLE_API_KEY'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-pro'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Business API
    |--------------------------------------------------------------------------
    */

    'whatsapp' => [
        'api_url' => env('WHATSAPP_API_URL'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'business_account_id' => env('WHATSAPP_BUSINESS_ACCOUNT_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WAHA (WhatsApp HTTP API) - Self-hosted
    |--------------------------------------------------------------------------
    | Documentación: https://waha.devlike.pro
    |
    | WAHA es una API HTTP auto-hospedada para WhatsApp.
    | - 1 contenedor soporta 500 sesiones simultáneas
    | - Cada tenant tiene 3 bots: inicial, primaria, secundaria
    | - Cada bot = 1 sesión WAHA
    */

    'waha' => [
        'api_url' => env('WAHA_API_URL', 'http://waha:3000'),
        'enabled' => env('ENABLE_WHATSAPP', true),
        'webhook_url' => env('WAHA_WEBHOOK_URL'), // URL para que WAHA envíe webhooks
        'max_sessions' => env('WAHA_MAX_SESSIONS', 500),
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase
    |--------------------------------------------------------------------------
    */

    'firebase' => [
        'project_id' => env('FIREBASE_PROJECT_ID'),
        'credentials' => env('FIREBASE_CREDENTIALS'),
    ],

];
