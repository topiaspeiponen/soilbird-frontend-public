<template>
  <v-col>
    <v-row v-if="dataLoaded">
      <v-expansion-panels accordion>
        <v-expansion-panel
          v-for="(property, index) in properties"
          :key="property.id"
        >
          <v-expansion-panel-header>{{
            property.name
          }}</v-expansion-panel-header>

          <v-expansion-panel-content>
            <v-expansion-panels accordion>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  {{ $t("logic.propertyAll") }}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-tabs v-model="activatedTabs[index]" icons-and-text>
                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.moisture") }}
                      <v-icon> mdi-water </v-icon>
                    </v-tab>

                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.temperature") }}
                      <v-icon>mdi-thermometer</v-icon>
                    </v-tab>

                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.salinity") }}
                      <v-icon>mdi-shaker-outline</v-icon>
                    </v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="activatedTabs[index]">
                    <v-list v-if="
                                !formIsActive(
                                  JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                                )
                              ">
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerMax") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === null
                            )[0].logic[activatedTabs[index]].abs_max
                          }}
                        </v-list-item-title>
                        <v-list-item-content> </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerWarningHigh") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === null
                            )[0].logic[activatedTabs[index]].warning_max
                          }}
                        </v-list-item-title>
                        <v-list-item-content> </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerNormal") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === null
                            )[0].logic[activatedTabs[index]].normal
                          }}
                        </v-list-item-title>
                        <v-list-item-content> </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerWarningLow") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === null
                            )[0].logic[activatedTabs[index]].warning_min
                          }}
                        </v-list-item-title>
                        <v-list-item-content> </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerMin") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === null
                            )[0].logic[activatedTabs[index]].abs_min
                          }}
                        </v-list-item-title>
                        <v-list-item-content> </v-list-item-content>
                      </v-list-item>
                      <v-btn
                        @click="
                          activateForm(
                            JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                          )
                        "
                      >
                        {{ $t("logic.editLogicBtn") }}
                      </v-btn>
                    </v-list>
                    <v-form :ref="JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              " v-model="validForms[JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              ]"
                              v-if="
                                formIsActive(
                                  JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                                )
                              "
                              >
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['max'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerMax') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].abs_max,
                            }) +')'"
                          :hint="
                            $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].abs_max,
                            })
                          "
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['warning_high'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningHigh') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].warning_max,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['normal'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerNormal') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].normal,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['warning_low'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningLow') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].warning_min,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['min'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerMin') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === null
                              )[0].logic[activatedTabs[index]].abs_min,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-btn @click="submitLogicChange(
                        JSON.stringify(property.id) +
                        JSON.stringify(activatedTabs[index]), null, property.id, activatedTabs[index]
                              )">
                        OK
                      </v-btn>
                      <v-btn @click="cancelFormEdit(
                        JSON.stringify(property.id) +
                        JSON.stringify(activatedTabs[index])
                      )">
                        {{ $t('logic.cancel') }}
                      </v-btn>
                    </v-form>
                  </v-tabs-items>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <div v-if="getTurfsForProperty(property.id).length > 1" class="turfs-expansion-panel-wrapper v-expansion-panel">
              <v-expansion-panel
                
                v-for="turf in getTurfsForProperty(property.id)"
                :key="turf.id"
              >
                <v-expansion-panel-header>
                  {{ turf.name }}
                </v-expansion-panel-header>
                <v-expansion-panel-content
                  v-if="turfHasOwnLogic(property.id, turf.id)"
                >
                  <v-tabs v-model="activatedTabs[index]" icons-and-text>
                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.moisture") }}
                      <v-icon> mdi-water </v-icon>
                    </v-tab>

                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.temperature") }}
                      <v-icon>mdi-thermometer</v-icon>
                    </v-tab>

                    <v-tab>
                      {{ $t("turfMonitorPage.sensors.salinity") }}
                      <v-icon>mdi-shaker-outline</v-icon>
                    </v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="activatedTabs[index]">
                    <v-list
                      v-if="
                        !formIsActive(JSON.stringify(property.id) +
                        JSON.stringify(turf.id) +
                        JSON.stringify(activatedTabs[index]), turf.id, property.id, activatedTabs[index]
                        )
                      "
                    >
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerMax") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === turf.id
                            )[0].logic[activatedTabs[index]].abs_max
                          }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerWarningHigh") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === turf.id
                            )[0].logic[activatedTabs[index]].warning_max
                          }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerNormal") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === turf.id
                            )[0].logic[activatedTabs[index]].normal
                          }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerWarningLow") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === turf.id
                            )[0].logic[activatedTabs[index]].warning_min
                          }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>
                          {{ $t("logic.innerMin") }}
                          {{
                            logics.filter(
                              (logic) =>
                                logic.sports_property_id === property.id &&
                                logic.turf_id === turf.id
                            )[0].logic[activatedTabs[index]].abs_min
                          }}
                        </v-list-item-title>
                      </v-list-item>
                      <v-btn
                        @click="
                          activateForm(
                            JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                          )
                        "
                      >
                        {{ $t("logic.editLogicBtn") }}
                      </v-btn>
                      <v-btn @click="deleteLogic(turf.id, property.id)">
                        {{ $t("logic.deleteLogicBtn") }}
                      </v-btn>
                    </v-list>
                    <v-form :ref="JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              " v-model="validForms[JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              ]"
                              v-if="
                                formIsActive(JSON.stringify(property.id) +
                        JSON.stringify(turf.id) +
                        JSON.stringify(activatedTabs[index]), turf.id, property.id, activatedTabs[index]
                                )
                              "
                              >
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['max'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerMax') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === turf.id
                              )[0].logic[activatedTabs[index]].abs_max,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['warning_high'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningHigh') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === turf.id
                              )[0].logic[activatedTabs[index]].warning_max,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['normal'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerNormal') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === turf.id
                              )[0].logic[activatedTabs[index]].normal,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['warning_low'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningLow') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === turf.id
                              )[0].logic[activatedTabs[index]].warning_min,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            form['min'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  JSON.stringify(activatedTabs[index])
                              )
                            ]
                          "
                          :label="$t('logic.innerMin') + ' (' + $t('logic.currentThreshold', {
                              n: logics.filter(
                                (logic) =>
                                  logic.sports_property_id === property.id &&
                                  logic.turf_id === turf.id
                              )[0].logic[activatedTabs[index]].abs_min,
                            }) + ')'"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-btn @click="submitLogicChange(
                        JSON.stringify(property.id) +
                        JSON.stringify(turf.id) +
                        JSON.stringify(activatedTabs[index]), turf.id, property.id, activatedTabs[index]
                              )">
                        OK
                      </v-btn>
                      <v-btn @click="cancelFormEdit(
                        JSON.stringify(property.id) +
                        JSON.stringify(turf.id) +
                        JSON.stringify(activatedTabs[index])
                      )">
                        {{ $t('logic.cancel') }}
                      </v-btn>
                    </v-form>
                  </v-tabs-items>
                </v-expansion-panel-content>

                <v-expansion-panel-content
                  v-if="!turfHasOwnLogic(property.id, turf.id)"
                >
                  <v-col v-if="!createFormActive(JSON.stringify(property.id) + JSON.stringify(turf.id))">
                    <h4>{{ $t("logic.noLogicCreated") }}</h4>
                    <v-btn @click="activateCreateForm(JSON.stringify(property.id) + JSON.stringify(turf.id))">
                      {{ $t("logic.createLogicBtn") }}
                    </v-btn>
                  </v-col>
                  <v-form v-if="createFormActive(JSON.stringify(property.id) + JSON.stringify(turf.id))"
                  :ref="JSON.stringify(property.id) + JSON.stringify(turf.id)"
                  v-model="validCreateForms[JSON.stringify(property.id) + JSON.stringify(turf.id)]">
                    <v-list-item>
                          <v-icon>
                            mdi-water
                          </v-icon>
                    <h4> {{ $t('turfMonitorPage.sensors.moisture') }} </h4>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['max'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 0
                              )
                            ]
                          "
                           :label="$t('logic.innerMax')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_high'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 0
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningHigh')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['normal'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 0
                              )
                            ]
                          "
                          :label="$t('logic.innerNormal')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_low'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 0
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningLow')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['min'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 0
                              )
                            ]
                          "
                          :label="$t('logic.innerMin')"
                        >
                        </v-text-field>
                      </v-list-item>

                      <v-list-item>
                          <v-icon>
                            mdi-thermometer
                          </v-icon>
                    <h4> {{ $t('turfMonitorPage.sensors.temperature') }} </h4>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['max'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 1
                              )
                            ]
                          "
                          :label="$t('logic.innerMax')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_high'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 1
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningHigh')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['normal'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 1
                              )
                            ]
                          "
                          :label="$t('logic.innerNormal')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_low'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 1
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningLow')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['min'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 1
                              )
                            ]
                          "
                          :label="$t('logic.innerMin')"
                        >
                        </v-text-field>
                      </v-list-item>

                      <v-list-item>
                          <v-icon>
                            mdi-shaker
                          </v-icon>
                    <h4> {{ $t('turfMonitorPage.sensors.salinity') }} </h4>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['max'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 2
                              )
                            ]
                          "
                          :label="$t('logic.innerMax')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_high'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 2
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningHigh')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-check
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['normal'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 2
                              )
                            ]
                          "
                          :label="$t('logic.innerNormal')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-exclamation-thick
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['warning_low'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) + 2
                              )
                            ]
                          "
                          :label="$t('logic.innerWarningLow')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon>
                            mdi-alert-decagram
                          </v-icon>
                        </v-list-item-icon>
                        <v-text-field
                          :rules="[rules.required, rules.number]"
                          v-model="
                            createForm['min'][
                              parseInt(
                                JSON.stringify(property.id) +
                                  JSON.stringify(turf.id) +
                                  2
                              )
                            ]
                          "
                          :label="$t('logic.innerMin')"
                        >
                        </v-text-field>
                      </v-list-item>
                      <v-btn @click="createNewLogic(
                        JSON.stringify(property.id) +
                        JSON.stringify(turf.id), turf.id, property.id
                              )">
                        OK
                      </v-btn>
                      <v-btn @click="cancelCreateFormEdit(
                        JSON.stringify(property.id) +
                        JSON.stringify(turf.id)
                      )">
                        {{ $t('logic.cancel') }}
                      </v-btn>
                  </v-form>
                </v-expansion-panel-content>
              </v-expansion-panel>
              </div>
            </v-expansion-panels>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-row>
    <v-progress-circular v-if="!dataLoaded" />
  </v-col>
</template>

<style lang="scss">
.container-logic {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: left;
}

.logic-control-panel,
.user-creation-panel {
  margin: 8px;
}
.edit-form {
  padding: 8px;
}

.create-form-title {
  display: flex;
  justify-content: center;
}

.turfs-expansion-panel-wrapper {
  width: 100%;
}
.property-expansion-panel {

}
</style>

<script lang="ts">
import { i18n } from "@/main";
import { Logic, NotificationLogic } from "@/static/NotificationEnumerators";
import { SportsProperty } from "@/static/SportsPropertyType";
import { Turf } from "@/static/TurfType";
import Vue from "vue";

export default Vue.extend({
  data: function() {
    return {
      logics: new Array<NotificationLogic>(),
      properties: new Array<SportsProperty>(),
      turfs: new Array<Turf>(),

      activatedTabs: new Array<number>(),
      activatedForms: new Array<string>(),
      activatedFormFields: new Array<{ [id: string]: Logic }>(),
      activatedCreateForms: new Array<string>(),
      form: {
        max: {} as { [id: string]: number },
        warning_high: {} as { [id: string]: number },
        normal: {} as { [id: string]: number },
        warning_low: {} as { [id: string]: number },
        min: {} as { [id: string]: number },
      },
      createForm: {
        max: {} as { [id: string]: number },
        warning_high: {} as { [id: string]: number },
        normal: {} as { [id: string]: number },
        warning_low: {} as { [id: string]: number },
        min: {} as { [id: string]: number },
      },
      validForms: {} as { [id: string]: boolean },
      validCreateForms: {} as { [id: string]: boolean },
      rules: {
        required: (value : any) => !!value || i18n.t('logic.formRuleRequired'),
        number: (value : number) => value > 0 && value < 1000 || i18n.t('logic.formRuleNumber'),
      },
      shownLogics: new Array<Logic>(),
      dataLoaded: false,
    };
  },
  async created() {
    await this.setupData()
  },
  methods: {
    async setupData() {
      const logics: NotificationLogic[] = await Vue.$notificationsAPI.getAllNotificationsLogic();
      const sportsProperties = await Vue.$sportsPropertyAPI.getAllSportsProperties();
      const turfs = await Vue.$sportsPropertyAPI.getAllTurfs();

      this.logics = logics;
      this.properties = sportsProperties;
      this.turfs = turfs;
      this.dataLoaded = true;
      let logicAmount: number[] = [];
      logics.map(() => {
        logicAmount.push(0);
      });
      this.activatedTabs = logicAmount;
      console.log("LogicEdit", logics, sportsProperties, turfs, this.dataLoaded);
    },
    async createNewLogic(id: string, turfId: number, propertyId: number) {
      const ref : any = this.$refs[id];
      ref[0].validate();
      console.log(this.validCreateForms[id])
      if (this.validCreateForms[id]) {

      console.log('creting new logic ', id, turfId, propertyId)

      let newLogic : NotificationLogic = {
        id: 0,
        turf_id: turfId,
        sports_property_id: propertyId,
        logic_type: 'threshold',
        device_type: 'sensor',
        logic: new Array<Logic>()
      }

      const newInnerLogic : Logic[] = [
        {name: 'moisture',
        abs_max: this.createForm.max[id + 0],
        abs_min: this.createForm.min[id + 0],
        warning_max: this.createForm.warning_high[id + 0],
        warning_min: this.createForm.warning_low[id + 0],
        normal: this.createForm.normal[id + 0],
        broken: 3},
        {name: 'temperature',
        abs_max: this.createForm.max[id + 1],
        abs_min: this.createForm.min[id + 1],
        warning_max: this.createForm.warning_high[id + 1],
        warning_min: this.createForm.warning_low[id + 1],
        normal: this.createForm.normal[id + 1],
        broken: 3},
        {name: 'salinity',
        abs_max: this.createForm.max[id + 2],
        abs_min: this.createForm.min[id + 2],
        warning_max: this.createForm.warning_high[id + 2],
        warning_min: this.createForm.warning_low[id + 2],
        normal: this.createForm.normal[id + 2],
        broken: 3}
      ]
      console.log(newInnerLogic)
      newLogic.logic = newInnerLogic;
      try {
            await Vue.$notificationsAPI.createNotificationsLogic(newLogic)
            console.log('success')
            this.deactivateCreateForm(id)
            this.createForm.max = { } as { [id: string]: number }
            this.createForm.warning_high = { } as { [id: string]: number }
            this.createForm.normal = { } as { [id: string]: number }
            this.createForm.warning_low = { } as { [id: string]: number }
            this.createForm.min = { } as { [id: string]: number }
            await this.setupData()
            
          } catch(err) {
            console.log('not success')
            this.createForm.max = { } as { [id: string]: number }
            this.createForm.warning_high = { } as { [id: string]: number }
            this.createForm.normal = { } as { [id: string]: number }
            this.createForm.warning_low = { } as { [id: string]: number }
            this.createForm.min = { } as { [id: string]: number }
            this.deactivateCreateForm(id)
          }
      }
    },
    async deleteLogic(turfId: number, propertyId: number) { 
      await Vue.$notificationsAPI.deleteNotificationsLogic(turfId, propertyId);
      await this.setupData()
    },
    getTurfsForProperty(id: number) {
      return this.turfs.filter((turf) => turf.sports_properties_id == id);
    },
    turfHasOwnLogic(propertyId: number, turfId: number) {
      return this.logics.find(
        (logic) =>
          logic.turf_id === turfId && logic.sports_property_id === propertyId
      );
    },
    getLogicForPropertyOrTurf() {},
    formIsActive(id: string) {
      console.log(
        "FormIsActive ", id
      );
      return this.activatedForms.includes(id);
    },
    createFormActive(id: string) {
      return this.activatedCreateForms.includes(id)
    },
    activateForm(id: string) {
      this.activatedForms.push(id);
      console.log("activateForm", this.activatedForms);
    },
    deactivateForm(id: string) {
      const newActivatedForms = this.activatedForms.filter(value => value !== id);
      this.activatedForms = newActivatedForms;
    },
    activateCreateForm(id: string) {
      this.activatedCreateForms.push(id)
    },
    deactivateCreateForm(id: string) {
      const newActivatedCreateForms = this.activatedCreateForms.filter(value => value !== id);
       console.log('deactivateCreateForm ', newActivatedCreateForms)
      this.activatedCreateForms = newActivatedCreateForms;
    },
    cancelFormEdit(id: string) {
      this.form.max = { } as { [id: string]: number }
            this.form.warning_high = { } as { [id: string]: number }
            this.form.normal = { } as { [id: string]: number }
            this.form.warning_low = { } as { [id: string]: number }
            this.form.min = { } as { [id: string]: number }
            this.activatedCreateForms = new Array<string>()
            this.deactivateForm(id)
    },
    cancelCreateFormEdit(id: string) {
      console.log('cancelcreateform edit')
      this.createForm.max = { } as { [id: string]: number }
      this.createForm.warning_high = { } as { [id: string]: number }
      this.createForm.normal = { } as { [id: string]: number }
      this.createForm.warning_low = { } as { [id: string]: number }
      this.createForm.min = { } as { [id: string]: number }
      this.activatedCreateForms = new Array<string>()
      this.deactivateCreateForm(id)
    },
    
    async submitLogicChange(id: string, turf_id: number | null, propertyId: number, activeTab: number) {
      console.log("Submitting form ", this.form, id, this.$refs[id], turf_id, propertyId, activeTab);
      const ref : any = this.$refs[id];
      ref[0].validate();
      console.log(this.validForms[id])
      if (this.validForms[id]) {
        console.log('success')
        let logicType : string = ''
        switch (activeTab) {
          case 0: 
            logicType = 'moisture'
            break;
          case 1:
            logicType = 'temperature'
            break;

          case 2:
            logicType = 'salinity'
            break;

          default:
            logicType = 'moisture'
            console.log('default activetab')
        }
        let currentLogic = this.logics.find((logic) => logic.turf_id === turf_id && logic.sports_property_id === propertyId)

        if (currentLogic) {
            currentLogic.logic[activeTab] = {
              name: logicType,
              broken: 3,
              normal: this.form.normal[id],
              abs_max: this.form.max[id],
              abs_min: this.form.min[id],
              warning_max: this.form.warning_high[id],
              warning_min: this.form.warning_low[id]
          }
          try {
            await Vue.$notificationsAPI.updateNotificationsLogic(currentLogic!)
            console.log('success')
            this.deactivateForm(id)
            this.form.max = { } as { [id: string]: number }
            this.form.warning_high = { } as { [id: string]: number }
            this.form.normal = { } as { [id: string]: number }
            this.form.warning_low = { } as { [id: string]: number }
            this.form.min = { } as { [id: string]: number }
            await this.setupData()
            
          } catch(err) {
            console.log('not success')
            this.form.max = { } as { [id: string]: number }
            this.form.warning_high = { } as { [id: string]: number }
            this.form.normal = { } as { [id: string]: number }
            this.form.warning_low = { } as { [id: string]: number }
            this.form.min = { } as { [id: string]: number }
            this.deactivateForm(id)
          }
        }
        
      } 
    },
  },
  watch: {
    activatedForms: function() {
      console.log("Activated forms changed ", this.activatedForms);
    },
    "form.max": function() {
      console.log("max ", this.form.max);
    },
  },
});
</script>
