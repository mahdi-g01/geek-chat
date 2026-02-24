<?php

namespace App\Enums;

enum MessageDisplayType: string
{

    case MESSAGE = "message";
    case IMAGE = "image";
    case VIDEO = "video";
    case LINK = "link";
    case IMAGE_GROUP = "image_group";
    case FILE_GROUP = "file_group";

}
