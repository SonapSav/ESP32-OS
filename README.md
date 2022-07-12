# ESP32-OS v0.1.0-alpha

ESP32-OS was originally developed by Panos Vasilopoulos (a.k.a. SonapSav) in 2022 as "proof of concept" for the Espressif's MCU ESP32. The software was created to provide a pseudo operational system to control and operate the ESP32 devices due to their limited capabilities to act as an OS host.

As such, ESP32-OS releases the MCU from the necessary "processor-hungry" and "memory-hungry" functions of the OS and transfers the burden to the user's browser.

ESP32-OS supports and requires the installation of an SD card for additional storage. As such, the developer suggests the installation of the software on the ESP32-CAM device installed with an SD Card of up to 32GB storage.

## Required hardware

- ESP32-CAM
- FTDI or USB Programmer
- SD Card (Up to 32GB)

## Required libraries

- #include <Arduino.h>
- #include "FS.h"
- #include <LittleFS.h>
- #include "SD_MMC.h" 
- #include <ESPmDNS.h>
- #include <WiFi.h>
- #include "time.h"
- #include <AsyncTCP.h>
- #include <ESPAsyncWebServer.h>
- #include <ArduinoJson.h> // v5.13.5 (IMPORTANT)
- #include "AsyncJson.h"

## Instructions for installation

1. Clone the repository in the folder you keep your Arduino projects
2. Ensure that you have a folder named libraries in your Arduino projects folder
3. Ensure that you have a folder named tools in your Arduino projects folder
4. Ensure that you have the above required libraries installed into your libraries folder. Otherwise download them there.
5. Ensure that the tools folder contains the following structured contents: ESP32FS > tool > esp32fs & mkfatfs & mklittlefs. Otherwise download the esp32fs plugin.
6. Format the SD Card with FAT32 format.
7. Create a folder in the root of the SD Card and name it sdcard.
8. Insert the card into the ESP32-CAM card reader.
9. Connect the ESP32-CAM with your computer either via FTDI or USB Programmer.
10. Identify the port number that has been assigned to your ESP32 by your computer (i.e. COM6).
11. Go to the cloned folder (ESP32-OS) and open the ESP32-OS.ino with Arduino IDE.
12. Replace where required with your preferences for username, password, WiFi SSID, WiFi Password, Static IP, domain name, etc. and save the file.
13. Select the appropriate board and port number.
14. Compile and upload the .ino file.
15. Upload the sketch data folder: (Arduino IDE) Tools > ESP32FS Sketch Data Upload.
16. Go to your preferred browser and type the static IP addresss you entered in the .ino file, or the domain name (i.e. http://192.168.1.2 or http://esp32.local)
17. You will be asked to enter the username and password for authentication.
18. Enjoy ;-)

## Limitations

1. Directory and file names cannot have space in-between i.e. instead of "New directory" -> "New_directory".
2. Absolute path names of directories or files stored in LittleFS cannot have more than 35 characters i.e. /home/something/something_else/file.txt (39 characters) will fail. The limitation does not apply for directories and files stored in SD_MMC
3. Regardless of the characters number; the maximum depth level of directories/sub-directories is five (5) both in LittleFS and SD_MMC i.e. /level_1/level_2/level_3/level_4/level_5
4. Maximum size of files to move/copy/edit is 90 Kb.
5. Maximum utilization of LittleFS available space is ~657 Kb.
6. Maximum utilization of SD_MMC available space is 3.9 GB.
7. Supported files: jpg, png, gif, html, htm, js, css, pdf, txt.
8. Currently, the main functions are performed via Term (Desktop > Term). The file explorers (Desktop > ESP32 and Desktop > SD) perform only exploring functions, not copy/paste/move/locate etc. For use of all supported functions of the Term hit the icon in the desktop and then type -help.
9. This work is still in progress...

## Term supported functions

<table>
  <tr>
    <th>Command</th>
    <th>Explanation</th>
    <th>Example</th>
  </tr>
  <tr>
    <td> pwd </td><td> Returns the absolute path of the present working directory </td><td> $pwd </td>
  </tr>
  <tr>
    <td> ls </td><td> Lists the folders and files of the present directory or lists the folders and files of a remote directory </td><td> $ls [path and name of directory] </td>
  </tr>
  <tr>
    <td> cd </td><td> Changes directory </td><td> $cd [path and name of directory] </td>
  </tr>
  <tr>
    <td> mkdir </td><td> Makes a new directory </td><td> $mkdir [path and name of the new directory] </td>
  </tr>
  <tr>
    <td> rmdir </td><td> Removes an empty directory </td><td> $rmdir [path and name of directory] </td>
  </tr>
  <tr>
    <td> rm </td><td> Removes a file </td><td> $rm [path name and extension of file] </td>
  </tr>
  <tr>
    <td> touch </td><td> Creates a new file </td><td> $touch [path name and extension of file] </td>
  </tr>
  <tr>
    <td> truncate </td><td> Truncates file </td><td> $truncate [path name and extension of file] </td>
  </tr>
  <tr>
    <td> cp </td><td> Copy file </td><td> $cp [path name extension of copy file] [new path name extension of paste file] </td>
  </tr>
  <tr>
    <td> mv </td><td> Moves or renames file </td><td> $mv [path name extension of file] [new path name extension of file] </td>
  </tr>
  <tr>
    <td> rename </td><td> Renames folder or file (Same directory) </td><td> $rename [path name extension of file] [new path name extension of file] </td>
  </tr>
  <tr>
    <td> locate </td><td> Locates files </td><td> $locate [keyword] </td>
  </tr>
  <tr>
    <td> echo </td><td> Writes in file </td><td> $echo [text] [path name extension of file] </td>
  </tr>
  <tr>
    <td> cat </td><td> Returns contents of file </td><td> $cat [path name extension of file] </td>
  </tr>
  <tr>
    <td> edit </td><td> Opens the editor to edit a file </td><td> $edit [path name extension of file] </td>
  </tr>
  <tr>
    <td> df </td><td> Returns disk filesystem summary including disk space </td><td> $df </td>
  </tr>
  <tr>
    <td> du </td><td> Returns the disk space in use of a particular directory </td><td> $du [path and name of directory] </td>
  </tr>
  <tr>
    <td> uname -[modifier] </td><td> Returns device and OS core information. For more details type uname -help </td><td> $ uname -[modifier] </td>
  </tr>
  <tr>
    <td> hostname </td><td> Returns the hostname </td><td> $hostname </td>
  </tr>
  <tr>
    <td> hostname -I </td><td> Returns the IP address of the host </td><td> $hostname -I </td>
  </tr>
  <tr>
    <td> reboot </td><td> Reboots the device </td><td> $reboot </td>
  </tr>
  <tr>
    <td> clear </td><td> Clears the terminal </td><td> $clear </td>
  </tr>
  <tr>
    <td> exit </td><td> Exits the terminal </td><td> $exit </td>
  </tr>
</table>
