import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import Vue from "vue";

export class UsersAPI {

    async getUsers() {
        try {
            const response = await Vue.$baseAPI.instance.get('users/all')
            return response.data
        } catch(err) {
            return null
        }
    }

      async createUser(username: string, password: string, credential_level: string) {
          try {
              console.log('Creating user USERSAPI')
            const response = await Vue.$baseAPI.instance.post('users/create', {
                username: username,
                password: password,
                credential_level: credential_level
            })
            console.log('User created ', response.data)
            return response.data
          } catch(err) {
              return null
          }
      }

      async updateUser(username: string, password: string, credential_level: string) {
        try {
            console.log('Updating user USERSAPI')
          const response = await Vue.$baseAPI.instance.post('users/update', {
              username: username,
              password: password,
              credential_level: credential_level
          })
          console.log('User updated ', response.data)
          return response.data
        } catch(err) {
            return null
        }
    }

    async removeUser(username: string) {
        try {
            console.log('removing user USERSAPI')
          const response = await Vue.$baseAPI.instance.delete('users/remove', {
            params: {username: username}
          })
          console.log('User removed ', response.data)
          return response.data
        } catch(err) {
            return null
        }
    }

    async checkUser(username: string) {
        try {
            console.log('checking user USERSAPI')
          const response = await Vue.$baseAPI.instance.get('users/check', {
              params: {username: username}
          })
          console.log('User checked ', response.data)
          return response.data
        } catch(err) {
            return null
        }
    }
    }