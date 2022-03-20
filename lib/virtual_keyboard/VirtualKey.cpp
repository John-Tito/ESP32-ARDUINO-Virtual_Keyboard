#include "VirtualKey.h"
#include <ArduinoJson.h>
#include <ESPAsyncWebServer.h>
#include <FS.h>
#include <SPIFFS.h>
#include <WiFi.h>

AsyncWebServer server(80);
AsyncWebSocket webSocket("/ws");

void notifyClients()
{
    webSocket.textAll("get");
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
    AwsFrameInfo *info = (AwsFrameInfo *)arg;

    data[len] = 0;
    Serial.println(String((const char *)data));
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)
    {
        data[len] = 0;
        Serial.printf("\n%s\n", data);
        notifyClients();
        // add your key process code here
        // async better
    }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len)
{
    switch (type)
    {
    case WS_EVT_CONNECT:
        Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
        break;
    case WS_EVT_DISCONNECT:
        Serial.printf("WebSocket client #%u disconnected\n", client->id());
        break;
    case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
        break;
    }
    webSocket.cleanupClients();
}

String processor(const String &var)
{
    Serial.println(var);

    return String();
}

void config_server(void)
{
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(SPIFFS, "/web/keyboard/index.html", String(), false, processor); });

    server.on("/index.html", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(SPIFFS, "/web/keyboard/index.html", String(), false, processor); });

    server.on("/keyboard.js", HTTP_GET, [](AsyncWebServerRequest *request)
              { request->send(SPIFFS, "/web/keyboard/keyboard.js", String(), false, processor); });

    server.onNotFound([](AsyncWebServerRequest *request)
                      { request->send(200, "text/plain", "Not Found"); });

    server.begin();
    webSocket.onEvent(onEvent);
    server.addHandler(&webSocket);
}

bool key_init()
{

    if (!(WiFi.isConnected() || WiFi.enableAP(true)))
    {
        Serial.println("config net first");
        return false;
    }

    // Initialize SPIFFS
    if (!SPIFFS.begin(true))
    {
        Serial.println("\nAn Error has occurred while mounting SPIFFS\n");
        return false;
    }
    Serial.printf("\nflash siez:%x, %x left\n", SPIFFS.totalBytes(), SPIFFS.totalBytes() - SPIFFS.usedBytes());

    Serial.println("\nconfig server\n");
    config_server();
    return true;
}
