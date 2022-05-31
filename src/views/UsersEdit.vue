<template>
  <div class="container-users">
    <v-card class="user-control-panel">
        <v-card-title>
            {{$t("users.listTitle")}}
        </v-card-title>
    <div class="user-list">
      <v-list>
          <template v-for="(user, index) in users">
              <v-divider
                :key="index"
            ></v-divider>
            <v-list-item :key="user.id">
            <v-list-item-content>
                <v-list-item-title>
                {{ user.username }}
                </v-list-item-title>
                <v-list-item-subtitle>
                {{ getLocalizedCredentialLevel(user.credential_level) }}
                </v-list-item-subtitle>
            </v-list-item-content>
            <v-divider></v-divider>
            </v-list-item>
          </template>
      </v-list>
    </div>
    </v-card>
    <v-card class="user-creation-panel">
        <v-card-title>
            {{$t("users.createTitle")}}
        </v-card-title>
        <div class="edit-form">
      <form>
        <v-text-field
          v-model="username"
          :label="$t('login.usernameLabel')"
          required
          :error-messages="usernameErrors"
          @input="$v.username.$touch()"
          @blur="$v.username.$touch()"
        >
        </v-text-field>
        <v-text-field
          v-model="password"
          :label="$t('login.passwordLabel')"
          required
          :error-messages="passwordErrors"
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        >
        </v-text-field>
        <v-select
          v-model="credential_level"
          :items="credentials"
          required
        ></v-select>
        <v-btn @click="submitUser">
          {{ $t("users.buttons.submit") }}
        </v-btn>
        <v-btn @click="clearUser">
          {{ $t("users.buttons.clear") }}
        </v-btn>
      </form>
    </div>
    </v-card>
    <v-snackbar v-model="snackbarStatus" :timeout="5000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<style lang="scss">
.container-users {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: left;
}

.user-control-panel, .user-creation-panel {
    margin: 8px;
}
.edit-form {
    padding: 8px;
}
</style>

<script lang="ts">
import Vue from 'vue'
import {CredentialLevel, CredentialLevelString} from '@/auth/UserType';
import {i18n} from '@/main'
import { required, minLength } from 'vuelidate/lib/validators'

export default Vue.extend({

    data: function() {
        return {
            username: "",
            usernameTaken: false,
            password: "",
            minLengthPassword: 8,
            credential_level: i18n.t('users.credentials[0]').toString(),
            credentials: [
                i18n.t('users.credentials[0]').toString(),
                i18n.t('users.credentials[1]').toString(),
                i18n.t('users.credentials[2]').toString()
            ],
            snackbarText: "",
            snackbarStatus: false,
            users: new Array<{id: number, username: string, credential_level: string}>()
        }
    },
    async mounted() {
        try {
          const users = await Vue.$usersAPI.getUsers()
          this.users = users
          console.log('mounted users edit getting all users ', users)
        } catch(err) {
            console.log('Could not get users in useredit list')
        }
    },
    computed: {
        getCredentialLevels() {
            for (const item in CredentialLevel) {
                  if (isNaN(Number(item))) {
                      console.log(item);
                  }
              }
            return Object.keys(CredentialLevel)
        },
        usernameErrors () {
          const errors : any[] = []
          if (!this.$v.username.$dirty) return errors
          !this.$v.username.required && errors.push(i18n.t('users.validation.usernameRequired').toString())
          this.usernameTaken && errors.push(i18n.t('users.validation.usernameTaken').toString())
          return errors
      },
      passwordErrors () {
          const errors : any[] = []
          if (!this.$v.password.$dirty) return errors
          !this.$v.password.required && errors.push(i18n.t('users.validation.passwordRequired').toString())
          !this.$v.password.minLength && errors.push(i18n.t('users.validation.passwordMinLength', {n: 8}).toString())
          return errors
      },
    },
    watch: {
        username: function() {
            console.log('username ', this.username)
        }
    },
    methods: {
        async submitUser() {
            this.$v.$touch()
            const userTaken = await Vue.$usersAPI.checkUser(this.username)
            if (!this.$v.$invalid && !userTaken) {
                console.log(' user submitted ', this.username, this.password, CredentialLevel[this.credentials.indexOf(this.credential_level)])
                const convertedCredentialLevel = CredentialLevel[this.credentials.indexOf(this.credential_level)]
                const createdUser = await Vue.$usersAPI.createUser(this.username, this.password, convertedCredentialLevel)
                this.snackbarText = i18n.t('users.created').toString()
                this.snackbarStatus = true
                this.clearUser()
                console.log('Created user response ', createdUser)
            }

        },
        clearUser() {
          this.$v.$reset()
          this.username = ''
          this.password = ''
          this.credential_level = i18n.t('users.credentials[0]').toString()
        },
        getLocalizedCredentialLevel(credential_level_db : CredentialLevelString) {
            console.log('Localized credentials ', credential_level_db)
            const credentialIndex = parseInt(CredentialLevel[credential_level_db].toString())
            return i18n.t('users.credentials[' + credentialIndex + ']').toString()
        },
    },
    validations: function()  {
        return {
                  username: {
                    required
                  },
              password: { required, minLength: minLength(8) }
        }
  }
}

)
</script>
