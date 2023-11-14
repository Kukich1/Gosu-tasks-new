<template>
    <div>
        <v-alert v-if="this.$store.state.showAlertTaskWorm" density="compact" type="warning" class="incomplete-task-alert" title="У вас не завершенные подзачачи!"
            closeable @input="showAlertWorm = false"></v-alert>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.incomplete-task-alert{
    position: absolute;
    top: 100px;
    right: 100px;
    z-index: 9999;
}
</style>