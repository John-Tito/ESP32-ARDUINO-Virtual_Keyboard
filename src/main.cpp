#include "VirtualKey.h"
#include "wifi_config.hpp"
#include <Arduino.h>

void setup()
{
    Serial.begin(115200);
    connect_to_wifi();
    key_init();
}

void loop()
{
}
