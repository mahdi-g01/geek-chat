<?php

namespace App\Enums;

enum StartupStages: string
{

    case STAGE_0_IDLE = "stage_0_idle";

    case STAGE_1_ENV_CONFIGURED = "stage_1_env_configured";

    case STAGE_2_DB_CONNECTED = "stage_2_db_connected";

    case STAGE_3_DB_MIGRATED = "stage_3_db_migrated";

    case STAGE_4_DB_SEEDED = "stage_4_db_seeded";

    case STAGE_5_ADMIN_USER_CREATED = "stage_5_admin_user_created";

    case STAGE_FINAL_APP_READY = "stage_final_app_ready";

}
