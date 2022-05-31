<template>
<div class="container">
  <div class="login-container">
    <v-img src="@/assets/soilbird_logo.png"> 

    </v-img>
    <span>
      {{ $t('app.description') }}
    </span>
    <v-text-field v-model="username" :label="$t('login.usernameLabel')"> </v-text-field>

    <v-text-field v-model="password" :label="$t('login.passwordLabel')"> </v-text-field>

    <v-btn @click="attemptLogin"> {{ $t('login.btn')}}</v-btn>
    <v-progress-circular class="loading-circle" v-if="loading" indeterminate size="50">
    </v-progress-circular>
  </div>
  <span class="version-text">
      {{ $t('app.version') }}
    </span>
</div>
</template>

<style lang="scss">
  .container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .login-container {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-flow: column nowrap;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    gap: 8px;
  }

  .loading-circle {
    margin-top: 16px;
    margin: auto;
  }

  .version-text {
    position: absolute;
    bottom: 0%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
  }
</style>

<script lang="ts">
import { CredentialLevel } from "@/auth/UserType";
import Vue from "vue";

export default Vue.extend({
  name: "Login",
  mounted() {
    console.log("path ", this.$route.params);
  },
  data: () => ({
    username: "",
    password: "",
    loading: false
  }),
  methods: {
    async attemptLogin() {
      this.loading = true
      console.log("path ", this.$route.params.nextUrl);
      await Vue.$authAPI
        .login(this.username, this.password)
        .then(async (response) => {
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("access_token", response.tokens.access_token);
          localStorage.setItem("refresh_token", response.tokens.refresh_token);
          console.log('response, ', response.user)
          const credential = CredentialLevel[response.user.credential_level]
          console.log('user type',credential)

          // After login was succesful, initialize baseAPI to setup interceptors
          await Vue.$baseAPI.init()
          if (this.$route.params.nextUrl != null) {
            this.$router.push(this.$route.params.nextUrl);
          } else {
              switch (parseInt(credential)) {
                  case 0: {
                      this.$router.push({path: '/common'})
                      break;
                  }
                  case 1: {
                      this.$router.push({path: '/boss'})
                      break;
                  }
                  case 2: {
                      this.$router.push({path: '/boss'})
                      break;
                  }
                  default: {
                      this.$router.push({path: '/login'})
                      break;
                  }
              }
          }
        }
        );
    },
  },
});
</script>
