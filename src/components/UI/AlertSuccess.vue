<template>
    <div>
        <v-alert v-if="this.$store.state.showAlertSuccess" density="compact" type="success" class="incomplete-task-alert"
            title="Проект завершон!" closeable @input="showAlertSuccess = false"></v-alert>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.incomplete-task-alert {
    position: absolute;
    top: 100px;
    right: 100px;
    z-index: 1001;
}
</style>