<?php

namespace App\Enums;

enum ChatTypes: string
{

    // A simple two-sided chat
    case DIALOG = "dialog";

    // A simple group
    case GROUP = "group";

    // An encrypted two-sided chat
    case ENCRYPTED_DIALOG = "encrypted_dialog";
}
