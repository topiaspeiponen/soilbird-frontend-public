<template>
    <v-card class="notifications-container">
        <v-card-title>
        {{ getNotifCardTitle }}
        </v-card-title>
        <v-progress-circular v-if="notificationsLoading" indeterminate />
        <div class="notification-block-container">
        <template v-for="notification in notifications">
            <v-hover v-slot="{ hover }" :key="notification.id">
            <div class="notification-block"  :style="{ backgroundColor: notification.color}" 
            :elevation="hover ? 12 : 2"
              :class="{ 'on-hover': hover }"
            >
                <aside class="icon-box">
                    <v-icon class="icon" x-large>
                        {{notification.icon}}
                    </v-icon>
                </aside>
                <div class="content">
                    <div class="title">
                            {{notification.title}}
                        </div>
                        <div class="details">
                            {{notification.details}}
                        </div>
                </div>
                <div class="info-box">
                    <div class="timestamp">
                            {{notification.timestamp}}
                    </div>
                    <v-btn elevation="3" outlined icon class="mark-as-read-btn" @click="markAsRead(notification.originalId)">
                        <v-icon>
                            mdi-check-outline
                        </v-icon>
                    </v-btn>
                </div>
            </div>
            </v-hover>
            </template>
        </div>
        <div class="load-failed-notifications" v-if="notifications.length === 0">
            <v-icon> mdi-check </v-icon>
            <p> {{ $t('success.emptyNotifications')}} </p>
        </div>
        <v-snackbar v-model="notificationReadSnackbar" timeout="3000">
            {{ $t('turfMonitorPage.notification.checked') }}
        </v-snackbar>
    </v-card>
</template>

<style lang="scss">
@use "@material/elevation";
@import '@/assets/global.scss';

    .notifications-container {
        flex-flow: column nowrap;
        padding: 4px;
    }
    .notification-block {
        @include elevation.elevation(8);
        margin: 8px;
        position: relative;
        width: 32.5%;
        min-height: 100px;
        align-items: center;
        border-radius: 4px;
        border-radius: 4px;
        justify-content: center;
        padding: 0;
        z-index: 3;
        display: flex;
        flex-flow: row nowrap;
        align-content: flex-start;
        transform: scale(1.025);
        
        transition: elevation 0.1s ease-in-out;
        transition: transform 0.1s ease-in-out;
    }   
    .notification-block-container {
        display: flex;
        flex-flow: row wrap;
    }
    .notification-block:not(.on-hover) {
        @include elevation.elevation(4);
        transform: scale(1);
    }
    .active {
        opacity: 1;
    }

    .load-failed-notifications {
        display: flex;
        flex-flow: column nowrap;
        width: 100%;
        height: auto;
        text-align: center;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        }

        .icon-box {
            width: 15%;
            text-align: center;
        }

        .content {
            width: 75%;
        }
        .info-box {
            width: 10%;
            display: flex;
            flex-flow: column nowrap
        }

    .title {
        padding: 4px;
    }
    .details {
        padding: 4px;
    }
    .timestamp {
        position: absolute;
        right: 0;
        top: 0;
        padding: 4px;
    }
    .mark-as-read-btn {
        position: absolute;
        margin: 4px;
        right: 0;
        bottom: 0;
    }
    
</style>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Turf } from '@/static/TurfType'
import { UserType } from '@/auth/UserType'
import { Notification } from '@/static/NotificationsType'
import { NotificationColorDictionary } from '@/static/NotificationEnumerators'
import { LocalizedNotification, NotificationLocalizer } from '@/services/NotificationLocalizer'
import {i18n} from '@/main'
// import {NotificationColorEnumerator} from '@/static/NotificationColorEnumerator';


export default Vue.extend({
    props: {
        field: {
            type: Object as PropType<Turf>,
            required: true,
        },
        propertyName: {
            type: String,
            required: true
        }
    },
    mounted() {
        this.setupNotifications()
    },
    data: function() {
        return {
            notificationReadSnackbar: false,
            notificationsLoading: true,
            notifications: new Array<LocalizedNotification>(),
            hover: false
        }
    },
    computed: {
        getNotifCardTitle() {
            const title = i18n.t('turfMonitorPage.notification.cardTitle').toString()
            if (this.field.path_name === 'kaikki') {
                const capitalizedPropertyName = this.propertyName.charAt(0).toUpperCase() + this.propertyName.slice(1)
                return title + " " + capitalizedPropertyName
            } else {
                return title + " " +this.field.name 
            }
        }
    },

    methods: {
        async setupNotifications() {
            this.getNotifications().then(async (notifs) => {
                console.log('notifs ', notifs)
                const localizer = new NotificationLocalizer()
                let localizedNotifications = new Array<LocalizedNotification>()
                for (const i in notifs!) {
                    const notificationResponse = await localizer.localizeNotification(notifs[i], this.field.path_name, this.field.sports_properties_id)
                    if (notificationResponse !== null) {
                        localizedNotifications.push(notificationResponse)
                    }
                }
                this.notifications = localizedNotifications
            })
        },
        async getNotifications() {
            const user : UserType = JSON.parse(localStorage.getItem('user')!)
            if (user) {
                const userId = user.id
                const notifications : Notification[] = await Vue.$notificationsAPI.getNotificationsForUser(this.field.sports_properties_id, userId)
                
                console.log("Notifications component ", notifications)
                this.notificationsLoading = false

                if (this.field.path_name !== 'kaikki') {
                    const filteredNotifications = notifications.filter((notification) => {
                        if (notification.turf_id === this.field.id) {
                            return notification
                        }
                    })
                    console.log('filtered nots ', filteredNotifications)
                    return filteredNotifications;
                } else {
                    return notifications
                }

                
            }
        },
        async editNotifications(notifications : Notification[]) {
            notifications.map((notif) => {
                var editedNotif : Notification

                editedNotif = notif
                editedNotif.severity = NotificationColorDictionary[editedNotif.severity]
                return editedNotif;
            })
            return notifications
        },
        async markAsRead(notificationId : number) {
            const user = localStorage.getItem('user')
            let id: number = -1

            if (user) {
                id = JSON.parse(user).id
            }
            if (id !== -1) {
                this.notificationReadSnackbar = true
                const currentNotifs = this.notifications
                const filteredNotifs = currentNotifs.filter((notification) => {
                    if (notification?.originalId !== notificationId) {
                        return notification
                    } 
                })
                this.notifications = filteredNotifs
                this.notifications.sort()
                console.log('mark as read', notificationId, filteredNotifs, this.notifications)
                await Vue.$notificationsAPI.markNotificationAsReadForUser(notificationId, id)

            }
        }
    },

    watch: {
        field: function() {
            this.notificationsLoading = true
            this.setupNotifications()
        }
    }
})
</script>