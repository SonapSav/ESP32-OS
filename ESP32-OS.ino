/* ESP32-OS
  
  MIT License
  
  Copyright (C) 2022 Panagiotis Vasilopoulos
  
  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  Libraries and other software included with the ESP32-OS are open source software; 
  licensed under the GPL 3.0, LGPL 3.0, Apache 2.0, and MIT Licenses.
  The exact distribution terms and licenses for each program are described in the
  individual files in /shared/licenses.
*/

#include <Arduino.h>
#include "FS.h"
#include <LittleFS.h>
#include "SD_MMC.h" 
#include <ESPmDNS.h>
#include <WiFi.h>
#include "time.h"
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include "AsyncJson.h"

#define FORMAT_LITTLEFS_IF_FAILED false

// Http authentication
const char* http_username = "admin";
const char* http_password = "admin";

// Wifi network credentials
const char* ssid = "VasilopoulosWiFi-Ext";
const char* password = "geBt3chermis69";
//const char* ssid = "VasilopoulosWiFi_FF_2.4GHz";
//const char* password = "geBt3chermis69";
//const char* ssid = "PVHS";
//const char* password = "geBt3chermis69!";

// Set static IP address
IPAddress local_IP(192, 168, 0, 222);

// Set gateway IP address
IPAddress gateway(192, 168, 0, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);
IPAddress secondaryDNS(8, 8, 4, 4);

// Webserver port and domain name
const int webserverPort = 80;
const char* domainName = "esp32os";
AsyncWebServer server(webserverPort);

// Check WiFi connection (Interval)
unsigned long previousMillis = 0;
unsigned long interval = 30000; // 30sec

// NTP offset settings
const long gmtOffset_sec = 14400; // 3600 x hrs
const int daylightOffset_sec = 0;

// Init epoch time
unsigned long epochTime;

// Get time since Unix epoch
unsigned long getTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return(0);
  }
  time(&now);
  return now;
}

bool printLocalTime()
{
  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return false;
  }
  Serial.println(&timeinfo, "%A, %B %d %Y %H:%M:%S");
  Serial.println(&timeinfo, "%s");
  return true;
}

bool createDir(fs::FS &fs, const char * path){
  Serial.printf("Creating Dir: %s\n", path);
  if(fs.mkdir(path)){
    Serial.println("Dir created");
    return true;
  } else {
    Serial.println("mkdir failed");
    return false;
  }
}

bool removeDir(fs::FS &fs, const char * path){
  Serial.printf("Removing Dir: %s\n", path);
  if(fs.rmdir(path)){
    Serial.println("Dir removed");
    return true;
  } else {
    Serial.println("rmdir failed");
    return false;
  }
}

bool renameDirFile(fs::FS &fs, const char * path1, const char * path2){
  Serial.printf("Renaming: %s\n", path1);
  if(fs.rename(path1, path2)){
    Serial.println("Dir/File renamed");
    return true;
  } else {
    Serial.println("Rename of dir/file failed");
    return false;
  }
}

bool renameFile(fs::FS &fs, const char * path1, const char * path2){
  Serial.printf("Renaming file %s to %s\n", path1, path2);
  if (fs.rename(path1, path2)) {
    Serial.println("File renamed");
    return true;
  } else {
    Serial.println("Rename failed");
    return false;
  }
}

bool deleteFile(fs::FS &fs, const char * path){
  Serial.printf("Deleting file: %s\n", path);
  if(fs.remove(path)){
    Serial.println("File deleted");
    return true;
  } else {
    Serial.println("Delete failed");
    return false;
  }
}

bool readFile(fs::FS &fs, const char * path){
  Serial.printf("Reading file: %s\n", path);
  File file = fs.open(path);
  if(!file){
    Serial.println("Failed to open file for reading");
    return false;
  }

  Serial.println("Read from file: ");
  while(file.available()){
    Serial.write(file.read());
  }
  return true;
  file.close();
}

bool makeFile(fs::FS &fs, const char * path){
  Serial.printf("Writing file: %s\n", path);
  File file = fs.open(path, FILE_WRITE);
  if(!file){
    Serial.println("Failed to open file for writing");
    file.close();
    return false;
  } else {
    Serial.println("Writing OK");
    file.close();
    return true;
  }
}

bool appendFile(fs::FS &fs, const char * path, const char * content){
  Serial.printf("Appending to file: %s\n", path);
  File file = fs.open(path, FILE_APPEND);
  if(!file){
    Serial.println("Failed to open file for appending");
    return false;
  }
  if(file.print(content)){
      file.print("\n");
      Serial.println("Content appended");
      return true;
  } else {
    Serial.println("Append failed");
    return false;
  }
  file.close();
}

bool copyFile(fs::FS &fs1, const char * path1, fs::FS &fs2, const char * path2){
  Serial.printf("Copying file: %s\n", path1);
  File file1 = fs1.open(path1, FILE_READ);
  if(file1 && makeFile(fs2, path2)){
    File file2 = fs2.open(path2, FILE_WRITE);
    while(file1.available()) {
      file2.write(file1.read());
    }
    file2.close();
    Serial.println("Copy OK");
    return true;
  } else {
    Serial.println("Copy FAIL");
    return false;
  }
  file1.close();
}

bool moveFile(fs::FS &fs1, const char * path1, fs::FS &fs2, const char * path2){
  Serial.printf("Copying file: %s\n", path1);
  File file1 = fs1.open(path1, FILE_READ);
  if(file1 && makeFile(fs2, path2)){
    File file2 = fs2.open(path2, FILE_WRITE);
    while(file1.available()) {
      file2.write(file1.read());
    }
    file2.close();
    Serial.println("Copy OK");
    file1.close();
    // Verify write
    if (deleteFile(fs1, path1)){
      Serial.println("Delete OK");
      return true;
    } else {
      Serial.println("Delete FAIL");
      return false;
    } 
  } else {
    Serial.println("Copy FAIL");
    return false;
    file1.close();
  }
}

void initWiFi() {
  // Uncomment to configure static IP address
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("STA Failed to configure");
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED){
    delay(1000);
    Serial.println("Connecting...");
  }

  // Configure Domain Name Service mDNS
  mdns_hostname_set(domainName);
  
  if(!MDNS.begin(domainName)){
     Serial.println("Error starting mDNS");
     return;
  }
  else{
    Serial.println("mDNS started successfuly");
    Serial.print("Listening to: http://");
    Serial.print(domainName);
    Serial.print(".local port: ");
    Serial.println(webserverPort);
  }

  // Add service to mDNS
  MDNS.addService("http", "tcp", 80);

  Serial.println("================================");
  Serial.println("WiFi");
  Serial.println("================================");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());
  Serial.print("RSSI: ");
  Serial.println(WiFi.RSSI());
}

void setup() {
  Serial.begin(115200);
  Serial.println("================================");
  Serial.println("New Boot/Reboot");
  Serial.println("================================");
  // Init WiFi
  initWiFi();
  Serial.println("================================");
  Serial.println("Boot time");
  Serial.println("================================");
  // Attempt (5) times to get time from NTP server
  // Worldwide pool.ntp.org
  // Asia asia.pool.ntp.org
  // Europe europe.pool.ntp.org
  // North America north-america.pool.ntp.org
  // Oceania oceania.pool.ntp.org
  // South America south-america.pool.ntp.org
  // Google time.google.com
  configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org");
  epochTime = getTime();
  if (epochTime == 0) {
    delay(1000);
    configTime(gmtOffset_sec, daylightOffset_sec, "time.google.com");
    epochTime = getTime();
    if (epochTime == 0) {
      delay(1000);
      configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org");
      epochTime = getTime();
      if (epochTime == 0) {
        delay(1000);
        configTime(gmtOffset_sec, daylightOffset_sec, "time.google.com");
        epochTime = getTime();
        if (epochTime == 0) {
          delay(1000);
          configTime(gmtOffset_sec, daylightOffset_sec, "pool.ntp.org");
          epochTime = getTime();
        }
      }
    }
  }
  Serial.println(epochTime);
  Serial.println("================================");
  Serial.println("Details");
  Serial.println("================================");
  Serial.print("Total RAM (bytes): ");
  Serial.println(ESP.getHeapSize());
  Serial.print("Used RAM (bytes): ");
  Serial.println(ESP.getHeapSize() - ESP.getFreeHeap());
  Serial.print("Free RAM (bytes): ");
  Serial.println(ESP.getFreeHeap());
  Serial.print("Total PSRAM (bytes): ");
  Serial.println(ESP.getPsramSize());
  Serial.print("Used PSRAM (bytes): ");
  Serial.println(ESP.getPsramSize() - ESP.getFreePsram());
  Serial.print("Free PSRAM (bytes): ");
  Serial.println(ESP.getFreePsram());
  Serial.print("Chip model: ");
  Serial.println(ESP.getChipModel());
  Serial.print("Core(s) number: ");
  Serial.println(ESP.getChipCores());
  Serial.print("Chip Revision: ");
  Serial.println(ESP.getChipRevision());
  Serial.print("CPU Frequency (MHz): ");
  Serial.println(ESP.getCpuFreqMHz());
  Serial.print("SDK Version: ");
  Serial.println(ESP.getSdkVersion());
  Serial.print("Flash chip size (bytes): ");
  Serial.println(ESP.getFlashChipSize());
  Serial.print("MAC: ");
  Serial.println(WiFi.macAddress());
  Serial.print("Efuse MAC: ");
  Serial.println(ESP.getEfuseMac());
  
  // https://github.com/espressif/arduino-esp32/blob/master/cores/esp32/Esp.h

  Serial.println("================================");
  if(!LittleFS.begin(FORMAT_LITTLEFS_IF_FAILED)){
    Serial.println("LittleFS Mount Failed");
    return;
  }
  else{
    Serial.println("LittleFS Mount Successful");
  }

  Serial.println("================================");
  if(!SD_MMC.begin("/sdcard", true)){
    Serial.println("SD Card Mount Failed");
    //return;
  }
  
  uint8_t cardType = SD_MMC.cardType();
  if(cardType == CARD_NONE){
    Serial.println("No SD Card attached");
    //return;
  }
  else {
    if(cardType == CARD_MMC){
      Serial.println("MMC Card Mount Successful");
    } else if(cardType == CARD_SD){
      Serial.println("SDSC Card Mount Successful");
    } else if(cardType == CARD_SDHC){
      Serial.println("SDHC Card Mount Successful");
    } else {
      Serial.println("UNKNOWN Card Mount Successful");
    }
  }
  
  // LittleFS total, used, and available space
  Serial.println("================================");
  Serial.println("Data Disk Space and Usage");
  Serial.println("================================");
  Serial.print("Total space: ");
  Serial.println(LittleFS.totalBytes());
  Serial.print("Used space: ");
  Serial.println(LittleFS.usedBytes());
  Serial.print("Available space: ");
  Serial.println(LittleFS.totalBytes() - LittleFS.usedBytes());

  // SD total, used, and available space
  Serial.println("================================");
  Serial.println("SD Card Space and Usage");
  Serial.println("================================");
  Serial.print("Total space: ");
  Serial.println(SD_MMC.totalBytes());
  Serial.print("Used space: ");
  Serial.println(SD_MMC.usedBytes());
  Serial.print("Available space: ");
  Serial.println(SD_MMC.totalBytes() - SD_MMC.usedBytes());

  // Web Server Root URL
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/www/os/index.html", "text/html");
  });
  
  server.serveStatic("/", LittleFS, "/www/os/index.html");

  server.serveStatic("/images/favicon.png", LittleFS, "/www/os/images/favicon.png");

  server.serveStatic("/images/avatar.png", LittleFS, "/www/os/images/avatar.png");

  server.serveStatic("/css/styles.css", LittleFS, "/www/os/css/styles.css");

  server.serveStatic("/js/scripts.js", LittleFS, "/www/os/js/scripts.js");

  // Reboot the device
  server.on("/reboot", HTTP_POST, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    request->send(200, "text/plain", "reboot");
    ESP.restart();
  });

  // Wifi info
  server.on("/wifi", HTTP_GET, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    request->send(200, "text/plain", (String)WiFi.RSSI() + "," + WiFi.localIP().toString() + "," + (String)WiFi.macAddress() + "," + WiFi.SSID());
  });
  
  server.on("/reboot", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    request->send(200, "text/plain", "reboot");
    ESP.restart();
  });

  // Uname.json - Tested with ArduinoJson 5.13.5
  server.on("/uname.json", HTTP_ANY, [](AsyncWebServerRequest * request) {
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    AsyncJsonResponse * response = new AsyncJsonResponse();
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Content-type","application/json");
    
    JsonObject& root = response->getRoot();
    
    JsonArray& uname = root.createNestedArray("uname");
    
    JsonObject& data = uname.createNestedObject();
    data["totalHeap"] = ESP.getHeapSize();
    data["usedHeap"] = ESP.getHeapSize() - ESP.getFreeHeap();
    data["freeHeap"] = ESP.getFreeHeap();
    data["totalPsram"] = ESP.getPsramSize();
    data["usedPsram"] = ESP.getPsramSize() - ESP.getFreePsram();
    data["freePsram"] = ESP.getFreePsram();
    data["chipModel"] = ESP.getChipModel();
    data["chipCores"] = ESP.getChipCores();
    data["chipRevision"] = ESP.getChipRevision();
    data["cpuFrequency"] = ESP.getCpuFreqMHz();
    data["sdkVersion"] = ESP.getSdkVersion();
    data["flashChipSize"] = ESP.getFlashChipSize();
    data["macAddress"] = WiFi.macAddress();
    data["deviceName"] = domainName;
    data["bootTime"] = epochTime;
    
    response->setLength();
    request->send(response);
  });

  // Filesystem.json - Tested with ArduinoJson 5.13.5
  server.on("/filesystem.json", HTTP_ANY, [](AsyncWebServerRequest * request) {
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    AsyncJsonResponse * response = new AsyncJsonResponse();
    response->addHeader("Access-Control-Allow-Origin", "*");
    response->addHeader("Content-type","application/json");

    // rootLevel FS
    JsonObject& rootLevelChild = response->getRoot();
    rootLevelChild["name"] = "/";
    rootLevelChild["type"] = "folder";
    rootLevelChild["path"] = "/";
    rootLevelChild["size"] = 4096;
    server.serveStatic("/", LittleFS, "/");
    
    // firstLevel FS folder
    JsonArray& firstLevelChildren = rootLevelChild.createNestedArray("children");
    File firstLevel = LittleFS.open("/");
    File firstLevelFile = firstLevel.openNextFile();
    while(firstLevelFile) {
      if(firstLevelFile.isDirectory()) {
        JsonObject& firstLevelChild = firstLevelChildren.createNestedObject();
        firstLevelChild["name"] = (String)firstLevelFile.name() + "/";
        firstLevelChild["type"] = "folder";
        firstLevelChild["path"] = (String)firstLevelFile.path() + "/";
        firstLevelChild["size"] = 4096;
        server.serveStatic(firstLevelFile.path(), LittleFS, firstLevelFile.path());
        
        // secondLevel FS folder
        JsonArray& secondLevelChildren = firstLevelChild.createNestedArray("children");
        File secondLevel = LittleFS.open(firstLevelFile.path());
        File secondLevelFile = secondLevel.openNextFile();
        while(secondLevelFile) {
          if(secondLevelFile.isDirectory()) {
            JsonObject& secondLevelChild = secondLevelChildren.createNestedObject();
            secondLevelChild["name"] = (String)secondLevelFile.name() + "/";
            secondLevelChild["type"] = "folder";
            secondLevelChild["path"] = (String)secondLevelFile.path() + "/";
            secondLevelChild["size"] = 4096;
            server.serveStatic(secondLevelFile.path(), LittleFS, secondLevelFile.path());
            
            // thirdLevel FS folder
            JsonArray& thirdLevelChildren = secondLevelChild.createNestedArray("children");
            File thirdLevel = LittleFS.open(secondLevelFile.path());
            File thirdLevelFile = thirdLevel.openNextFile();
            while(thirdLevelFile) {
              if(thirdLevelFile.isDirectory()) {
                JsonObject& thirdLevelChild = thirdLevelChildren.createNestedObject();
                thirdLevelChild["name"] = (String)thirdLevelFile.name() + "/";
                thirdLevelChild["type"] = "folder";
                thirdLevelChild["path"] = (String)thirdLevelFile.path() + "/";
                thirdLevelChild["size"] = 4096;
                server.serveStatic(thirdLevelFile.path(), LittleFS, thirdLevelFile.path());

                // fourthLevel FS folder
                JsonArray& fourthLevelChildren = thirdLevelChild.createNestedArray("children");
                File fourthLevel = LittleFS.open(thirdLevelFile.path());
                File fourthLevelFile = fourthLevel.openNextFile();
                while(fourthLevelFile) {
                  if(fourthLevelFile.isDirectory()) {
                    JsonObject& fourthLevelChild = fourthLevelChildren.createNestedObject();
                    fourthLevelChild["name"] = (String)fourthLevelFile.name() + "/";
                    fourthLevelChild["type"] = "folder";
                    fourthLevelChild["path"] = (String)fourthLevelFile.path() + "/";
                    fourthLevelChild["size"] = 4096;
                    server.serveStatic(fourthLevelFile.path(), LittleFS, fourthLevelFile.path());
                    
                    // fifthLevel FS folder
                    JsonArray& fifthLevelChildren = fourthLevelChild.createNestedArray("children");
                    File fifthLevel = LittleFS.open(fourthLevelFile.path());
                    File fifthLevelFile = fifthLevel.openNextFile();
                    while(fifthLevelFile) {
                      if(fifthLevelFile.isDirectory()) {
                        JsonObject& fifthLevelChild = fifthLevelChildren.createNestedObject();
                        fifthLevelChild["name"] = (String)fifthLevelFile.name() + "/";
                        fifthLevelChild["type"] = "folder";
                        fifthLevelChild["path"] = (String)fifthLevelFile.path() + "/";
                        fifthLevelChild["size"] = 4096;
                        server.serveStatic(fifthLevelFile.path(), LittleFS, fifthLevelFile.path());
                      }
                      
                      // fifthLevel FS file
                      else {
                        JsonObject& fifthLevelChild = fifthLevelChildren.createNestedObject();
                        fifthLevelChild["name"] = (String)fifthLevelFile.name();
                        fifthLevelChild["type"] = "file";
                        fifthLevelChild["path"] = (String)fifthLevelFile.path();
                        fifthLevelChild["size"] = fifthLevelFile.size();
                        fifthLevelChild["children"] = "";
                        server.serveStatic(fifthLevelFile.path(), LittleFS, fifthLevelFile.path());
                      }
                      fifthLevelFile = fifthLevel.openNextFile();
                    }
                    
                  }
                  
                  // fourthLevel FS file
                  else {
                    JsonObject& fourthLevelChild = fourthLevelChildren.createNestedObject();
                    fourthLevelChild["name"] = (String)fourthLevelFile.name();
                    fourthLevelChild["type"] = "file";
                    fourthLevelChild["path"] = (String)fourthLevelFile.path();
                    fourthLevelChild["size"] = fourthLevelFile.size();
                    fourthLevelChild["children"] = "";
                    server.serveStatic(fourthLevelFile.path(), LittleFS, fourthLevelFile.path());
                  }
                  fourthLevelFile = fourthLevel.openNextFile();
                }
                
              }
              
              // thirdLevel FS file
              else {
                JsonObject& thirdLevelChild = thirdLevelChildren.createNestedObject();
                thirdLevelChild["name"] = (String)thirdLevelFile.name();
                thirdLevelChild["type"] = "file";
                thirdLevelChild["path"] = (String)thirdLevelFile.path();
                thirdLevelChild["size"] = thirdLevelFile.size();
                thirdLevelChild["children"] = "";
                server.serveStatic(thirdLevelFile.path(), LittleFS, thirdLevelFile.path());
              }
              thirdLevelFile = thirdLevel.openNextFile();
            }
            
          }
          
          // secondLevel FS file 
          else {
            JsonObject& secondLevelChild = secondLevelChildren.createNestedObject();
            secondLevelChild["name"] = (String)secondLevelFile.name();
            secondLevelChild["type"] = "file";
            secondLevelChild["path"] = (String)secondLevelFile.path();
            secondLevelChild["size"] = secondLevelFile.size();
            secondLevelChild["children"] = "";
            server.serveStatic(secondLevelFile.path(), LittleFS, secondLevelFile.path());
          }
          secondLevelFile = secondLevel.openNextFile();
        }
        
      }
      
      // firstLevel FS file
      else {
        JsonObject& firstLevelChild = firstLevelChildren.createNestedObject();
        firstLevelChild["name"] = (String)firstLevelFile.name();
        firstLevelChild["type"] = "file";
        firstLevelChild["path"] = (String)firstLevelFile.path();
        firstLevelChild["size"] = firstLevelFile.size();
        firstLevelChild["children"] = "";
        server.serveStatic(firstLevelFile.path(), LittleFS, firstLevelFile.path());
      }
      firstLevelFile = firstLevel.openNextFile();
    }
    
    uint8_t cardType = SD_MMC.cardType();
    if(cardType != CARD_NONE){
      // rootLevel SD
      JsonObject& rootLevelChildSD = firstLevelChildren.createNestedObject();
      rootLevelChildSD["name"] = "sdcard/";
      rootLevelChildSD["type"] = "folder";
      rootLevelChildSD["path"] = "/sdcard/";
      rootLevelChildSD["size"] = 4096;
      server.serveStatic("/sdcard/", SD_MMC, "/sdcard/");
  
  
      // firstLevel SD folder
      JsonArray& firstLevelChildrenSD = rootLevelChildSD.createNestedArray("children");
      File firstLevelSD = SD_MMC.open("/sdcard");
      File firstLevelFileSD = firstLevelSD.openNextFile();
      while(firstLevelFileSD) {
        if(firstLevelFileSD.isDirectory()) {
          JsonObject& firstLevelChildSD = firstLevelChildrenSD.createNestedObject();
          firstLevelChildSD["name"] = (String)firstLevelFileSD.name() + "/";
          firstLevelChildSD["type"] = "folder";
          firstLevelChildSD["path"] = (String)firstLevelFileSD.path() + "/";
          firstLevelChildSD["size"] = 4096;
          server.serveStatic(firstLevelFileSD.path(), SD_MMC, firstLevelFileSD.path());
          
          // secondLevel SD folder
          JsonArray& secondLevelChildrenSD = firstLevelChildSD.createNestedArray("children");
          File secondLevelSD = SD_MMC.open(firstLevelFileSD.path());
          File secondLevelFileSD = secondLevelSD.openNextFile();
          while(secondLevelFileSD) {
            if(secondLevelFileSD.isDirectory()) {
              JsonObject& secondLevelChildSD = secondLevelChildrenSD.createNestedObject();
              secondLevelChildSD["name"] = (String)secondLevelFileSD.name() + "/";
              secondLevelChildSD["type"] = "folder";
              secondLevelChildSD["path"] = (String)secondLevelFileSD.path() + "/";
              secondLevelChildSD["size"] = 4096;
              server.serveStatic(secondLevelFileSD.path(), SD_MMC, secondLevelFileSD.path());
              
              // thirdLevel SD folder
              JsonArray& thirdLevelChildrenSD = secondLevelChildSD.createNestedArray("children");
              File thirdLevelSD = SD_MMC.open(secondLevelFileSD.path());
              File thirdLevelFileSD = thirdLevelSD.openNextFile();
              while(thirdLevelFileSD) {
                if(thirdLevelFileSD.isDirectory()) {
                  JsonObject& thirdLevelChildSD = thirdLevelChildrenSD.createNestedObject();
                  thirdLevelChildSD["name"] = (String)thirdLevelFileSD.name() + "/";
                  thirdLevelChildSD["type"] = "folder";
                  thirdLevelChildSD["path"] = (String)thirdLevelFileSD.path() + "/";
                  thirdLevelChildSD["size"] = 4096;
                  server.serveStatic(thirdLevelFileSD.path(), SD_MMC, thirdLevelFileSD.path());
  
                  // fourthLevel SD folder
                  JsonArray& fourthLevelChildrenSD = thirdLevelChildSD.createNestedArray("children");
                  File fourthLevelSD = SD_MMC.open(thirdLevelFileSD.path());
                  File fourthLevelFileSD = fourthLevelSD.openNextFile();
                  while(fourthLevelFileSD) {
                    if(fourthLevelFileSD.isDirectory()) {
                      JsonObject& fourthLevelChildSD = fourthLevelChildrenSD.createNestedObject();
                      fourthLevelChildSD["name"] = (String)fourthLevelFileSD.name() + "/";
                      fourthLevelChildSD["type"] = "folder";
                      fourthLevelChildSD["path"] = (String)fourthLevelFileSD.path() + "/";
                      fourthLevelChildSD["size"] = 4096;
                      server.serveStatic(fourthLevelFileSD.path(), SD_MMC, fourthLevelFileSD.path());
                      
                      // fifthLevel SD folder
                      JsonArray& fifthLevelChildrenSD = fourthLevelChildSD.createNestedArray("children");
                      File fifthLevelSD = SD_MMC.open(fourthLevelFileSD.path());
                      File fifthLevelFileSD = fifthLevelSD.openNextFile();
                      while(fifthLevelFileSD) {
                        if(fifthLevelFileSD.isDirectory()) {
                          JsonObject& fifthLevelChildSD = fifthLevelChildrenSD.createNestedObject();
                          fifthLevelChildSD["name"] = (String)fifthLevelFileSD.name() + "/";
                          fifthLevelChildSD["type"] = "folder";
                          fifthLevelChildSD["path"] = (String)fifthLevelFileSD.path() + "/";
                          fifthLevelChildSD["size"] = 4096;
                          server.serveStatic(fifthLevelFileSD.path(), SD_MMC, fifthLevelFileSD.path());
                        }
                        
                        // fifthLevel SD file
                        else {
                          JsonObject& fifthLevelChildSD = fifthLevelChildrenSD.createNestedObject();
                          fifthLevelChildSD["name"] = (String)fifthLevelFileSD.name();
                          fifthLevelChildSD["type"] = "file";
                          fifthLevelChildSD["path"] = (String)fifthLevelFileSD.path();
                          fifthLevelChildSD["size"] = fifthLevelFileSD.size();
                          fifthLevelChildSD["children"] = "";
                          server.serveStatic(fifthLevelFileSD.path(), SD_MMC, fifthLevelFileSD.path());
                        }
                        fifthLevelFileSD = fifthLevelSD.openNextFile();
                      }
                      
                    }
                    
                    // fourthLevel SD file
                    else {
                      JsonObject& fourthLevelChildSD = fourthLevelChildrenSD.createNestedObject();
                      fourthLevelChildSD["name"] = (String)fourthLevelFileSD.name();
                      fourthLevelChildSD["type"] = "file";
                      fourthLevelChildSD["path"] = (String)fourthLevelFileSD.path();
                      fourthLevelChildSD["size"] = fourthLevelFileSD.size();
                      fourthLevelChildSD["children"] = "";
                      server.serveStatic(fourthLevelFileSD.path(), SD_MMC, fourthLevelFileSD.path());
                    }
                    fourthLevelFileSD = fourthLevelSD.openNextFile();
                  }
                  
                }
                
                // thirdLevel SD file
                else {
                  JsonObject& thirdLevelChildSD = thirdLevelChildrenSD.createNestedObject();
                  thirdLevelChildSD["name"] = (String)thirdLevelFileSD.name();
                  thirdLevelChildSD["type"] = "file";
                  thirdLevelChildSD["path"] = (String)thirdLevelFileSD.path();
                  thirdLevelChildSD["size"] = thirdLevelFileSD.size();
                  thirdLevelChildSD["children"] = "";
                  server.serveStatic(thirdLevelFileSD.path(), SD_MMC, thirdLevelFileSD.path());
                }
                thirdLevelFileSD = thirdLevelSD.openNextFile();
              }
              
            }
            
            // secondLevel SD file 
            else {
              JsonObject& secondLevelChildSD = secondLevelChildrenSD.createNestedObject();
              secondLevelChildSD["name"] = (String)secondLevelFileSD.name();
              secondLevelChildSD["type"] = "file";
              secondLevelChildSD["path"] = (String)secondLevelFileSD.path();
              secondLevelChildSD["size"] = secondLevelFileSD.size();
              secondLevelChildSD["children"] = "";
              server.serveStatic(secondLevelFileSD.path(), SD_MMC, secondLevelFileSD.path());
            }
            secondLevelFileSD = secondLevelSD.openNextFile();
          }
          
        }
        
        // firstLevel SD file
        else {
          JsonObject& firstLevelChildSD = firstLevelChildrenSD.createNestedObject();
          firstLevelChildSD["name"] = (String)firstLevelFileSD.name();
          firstLevelChildSD["type"] = "file";
          firstLevelChildSD["path"] = (String)firstLevelFileSD.path();
          firstLevelChildSD["size"] = firstLevelFileSD.size();
          firstLevelChildSD["children"] = "";
          server.serveStatic(firstLevelFileSD.path(), SD_MMC, firstLevelFileSD.path());
        }
        firstLevelFileSD = firstLevelSD.openNextFile();
      }
    }
    
    response->setLength();
    request->send(response);
  });

  // Make directory
  server.on("/mkdir", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    if (paramNum != 2 || fs->name() != "fs" || path->name() != "path"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        if (fs->value() == "SD"){
          if (createDir(SD_MMC, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (createDir(LittleFS, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Delete empty directory
  server.on("/rmdir", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    if (paramNum != 2 || fs->name() != "fs" || path->name() != "path"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        if (fs->value() == "SD"){
          if (removeDir(SD_MMC, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (removeDir(LittleFS, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Rename directory or file (without moving)
  server.on("/rename", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path1 = request->getParam(1);
    AsyncWebParameter* path2 = request->getParam(2);
    if (paramNum != 3 || fs->name() != "fs" || path1->name() != "path1"  || path2->name() != "path2"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar1 = path1->value().c_str();
        const char* pathChar2 = path2->value().c_str();
        if (fs->value() == "SD"){
          if (renameDirFile(SD_MMC, pathChar1, pathChar2)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (renameDirFile(LittleFS, pathChar1, pathChar2)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Copy file
  server.on("/cp", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs1 = request->getParam(0);
    AsyncWebParameter* path1 = request->getParam(1);
    AsyncWebParameter* fs2 = request->getParam(2);
    AsyncWebParameter* path2 = request->getParam(3);
    if (paramNum != 4 || fs1->name() != "fs1" || path1->name() != "path1" || fs2->name() != "fs2" || path2->name() != "path2"){
      request->send(400);
    }
    else {
      if (fs1->value() != "SD" && fs1->value() != "LittleFS" && fs2->value() != "SD" && fs2->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar1 = path1->value().c_str();
        const char* pathChar2 = path2->value().c_str();

        if (fs1->value() == "SD" && fs2->value() == "SD"){
          if (copyFile(SD_MMC, pathChar1, SD_MMC, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "SD and SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else if (fs1->value() == "SD" && fs2->value() == "LittleFS"){
          if (copyFile(SD_MMC, pathChar1, LittleFS, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "SD and LittleFS Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else if (fs1->value() == "LittleFS" && fs2->value() == "SD"){
          if (copyFile(LittleFS, pathChar1, SD_MMC, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "LittleFS and SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (copyFile(LittleFS, pathChar1, LittleFS, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "LittleFS and LittleFS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Move/Rename file
  server.on("/mv", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs1 = request->getParam(0);
    AsyncWebParameter* path1 = request->getParam(1);
    AsyncWebParameter* fs2 = request->getParam(2);
    AsyncWebParameter* path2 = request->getParam(3);
    if (paramNum != 4 || fs1->name() != "fs1" || path1->name() != "path1" || fs2->name() != "fs2" || path2->name() != "path2"){
      request->send(400);
    }
    else {
      if (fs1->value() != "SD" && fs1->value() != "LittleFS" && fs2->value() != "SD" && fs2->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar1 = path1->value().c_str();
        const char* pathChar2 = path2->value().c_str();

        if (fs1->value() == "SD" && fs2->value() == "SD"){
          if (moveFile(SD_MMC, pathChar1, SD_MMC, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "SD and SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else if (fs1->value() == "SD" && fs2->value() == "LittleFS"){
          if (moveFile(SD_MMC, pathChar1, LittleFS, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "SD and LittleFS Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else if (fs1->value() == "LittleFS" && fs2->value() == "SD"){
          if (moveFile(LittleFS, pathChar1, SD_MMC, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "LittleFS and SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (moveFile(LittleFS, pathChar1, LittleFS, pathChar2)){
            Serial.println("FS1: " + fs1->value());
            Serial.println("Path1: " + path1->value());
            Serial.println("FS2: " + fs2->value());
            Serial.println("Path2: " + path2->value());
            request->send(200, "text/plain", "LittleFS and LittleFS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Delete file
  server.on("/rm", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    if (paramNum != 2 || fs->name() != "fs" || path->name() != "path"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        if (fs->value() == "SD"){
          if (deleteFile(SD_MMC, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (deleteFile(LittleFS, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // New file
  server.on("/touch", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    if (paramNum != 2 || fs->name() != "fs" || path->name() != "path"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        if (fs->value() == "SD"){
          if (makeFile(SD_MMC, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (makeFile(LittleFS, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Write on file
  server.on("/echo", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    AsyncWebParameter* content = request->getParam(2);
    if (paramNum != 3 || fs->name() != "fs" || path->name() != "path" || content->name() != "content"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        const char* contentChar = content->value().c_str();
        if (fs->value() == "SD"){
          if (appendFile(SD_MMC, pathChar, contentChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            Serial.println("Content: " + content->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (appendFile(LittleFS, pathChar, contentChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            Serial.println("Content: " + content->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  // Truncate file
  server.on("/truncate", HTTP_ANY, [](AsyncWebServerRequest *request){
    if(!request->authenticate(http_username, http_password))
      return request->requestAuthentication();
    int paramNum = request->params();
    AsyncWebParameter* fs = request->getParam(0);
    AsyncWebParameter* path = request->getParam(1);
    if (paramNum != 2 || fs->name() != "fs" || path->name() != "path"){
      request->send(400);
    }
    else {
      if (fs->value() != "SD" && fs->value() != "LittleFS"){
        request->send(400);
      }
      else {
        const char* pathChar = path->value().c_str();
        if (fs->value() == "SD"){
          if (deleteFile(SD_MMC, pathChar) && makeFile(SD_MMC, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "SD Parameters received");
          }
          else {
            request->send(400);
          }
        }
        else {
          if (deleteFile(LittleFS, pathChar) && makeFile(LittleFS, pathChar)){
            Serial.println("FS: " + fs->value());
            Serial.println("Path: " + path->value());
            request->send(200, "text/plain", "FS Parameters received");
          }
          else {
            request->send(400);
          }
        }
      }
    }
  });

  server.on("/logout", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(401);
  });
  
  server.begin();
}

// Nothing much to do in the loop. Execute a yield to keep the WiFi alive.
void loop() {
  yield();

  unsigned long currentMillis = millis();
  
  // if WiFi is down, try reconnecting every x seconds (Check interval)
  if ((WiFi.status() != WL_CONNECTED) && (currentMillis - previousMillis >=interval)) {
    Serial.print(millis());
    Serial.println("Reconnecting to WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
    previousMillis = currentMillis;
  }
}
