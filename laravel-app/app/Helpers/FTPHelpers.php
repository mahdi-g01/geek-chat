<?php

namespace App\Helpers;
use FTP\Connection;
use Illuminate\Support\Facades\Storage;

class FTPHelpers
{

    protected ?\Illuminate\Contracts\Filesystem\Filesystem $disk = null;
    protected Connection|null|bool $connection = null;

    public function __construct()
    {
        $this->disk = Storage::disk('ftp');
    }

    protected function connect(): void
    {
        $this->connection = ftp_connect(
            config('filesystems.disks.ftp.host'),
            config('filesystems.disks.ftp.port')
        );
    }

    protected function login(): bool
    {
        if (!$this->connection)
            return false;
        return ftp_login(
            $this->connection,
            config('filesystems.disks.ftp.username'),
            config('filesystems.disks.ftp.password'),
        );
    }

    protected function close(): bool
    {
        if (!$this->connection)
            return false;
        return ftp_close($this->connection);
    }

    public function getOccupiedSpace(): int
    {
        $used = 0;

        try {

            $disk = $this->disk;

            $files = $disk->allFiles();
            foreach ($files as $file) {
                $size = $this->disk->size($file);
                if ($size !== false) {
                    $used += $size;
                }
            }

        } catch (\Exception $e) {

        }

        return $used;
    }


    public function getTotalSpace(): ?int
    {
        if (!$this->connection)
            return 0;

        $total = null;
        $used = null;

        try {

            @$this->connect();
            @$this->login();

            $command = 'SITE QUOTA';
            $output  = ftp_raw($this->connection, $command);

            if ($output !== FALSE) {

                foreach ($output as $line) {

                    if (str_starts_with($line, 'QUOTA')) {
                        // Parse the quota information from the response
                        // This will depend on the format of the server's response
                        preg_match('/QUOTA (\d+)\/(\d+)/', $line, $matches);
                        if (isset($matches[1]) && isset($matches[2])) {
                            $used = $matches[1];
                            $total = $matches[2];
                        }

                    }
                }
            }

            @$this->close();
        } catch (\Exception $e) {

        }

        return $total;
    }

}
