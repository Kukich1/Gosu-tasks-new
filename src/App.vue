<template>
  <v-app>
    <v-main class="color">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({}),
}
</script>

<style>
.color {
  background-color: #f4f7fd;
}
</style>