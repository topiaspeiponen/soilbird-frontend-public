<template>
<div class="comparison-tool-container">
    <div class="text-h5">
    </div>
    <comparison-chart />
</div>
</template>

<style>
    .comparison-tool-container {
        width: 100%;
        height: 100%;
    }
</style>

<script lang="ts">
import Vue from 'vue'
import ComparisonChart from '../components/ComparisonChart.vue'

export default Vue.extend({
    components: {ComparisonChart},
    data: function() {
        return {
        }
    }
})
</script>