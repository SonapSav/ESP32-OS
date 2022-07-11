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

## Instruction for installation

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
