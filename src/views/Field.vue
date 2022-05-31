<template>
    <div>
        <device-monitor :field="turf" :propertyName="propertyName"/>
        <notifications :field="turf" :propertyName="propertyName" />
        
    </div>
</template>

<script lang="ts">
import DeviceMonitor from '@/components/DeviceMonitor.vue';
import Notifications from '@/components/Notifications.vue';
import { Turf } from '@/static/TurfType';
import Vue, { PropType } from 'vue'

export default Vue.extend({
  components: { DeviceMonitor, Notifications },

  props: {
      turf: {
          required: true,
          type: Object as PropType<Turf>,
      },
      propertyName: {
          required: true,
          type: String
      }
  },

    mounted() {
        console.log('Field.vue ', this.turf)
    },
    computed: {
        getField: function() {
            return 'xd'
        }
    },
    watch: {
        'turf': function() {
            console.log('turf changed ', this.turf)
        }
    }
})
</script>

<style>

</style>