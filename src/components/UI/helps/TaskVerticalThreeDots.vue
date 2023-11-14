<template>
    <div>
        <v-menu v-model="menu" offset-y>
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
            </template>

            <v-list>
                <v-list-item @click="emitEditDialog">Edit</v-list-item>
                <v-list-item class="red-text" @click="emitDeleteProject">Delete</v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>
  
<script>
export default {
    data: () => ({
        menu: false,
    }),
    props: {
        taskData: Object,
    },
    methods: {
        emitEditDialog() {
            this.$emit("editDialog",true)
            this.$emit("editProject", this.taskData)
            this.$store.commit("SET_TASK_EDIT", this.taskData)
            this.$store.commit("SET_SHOW_EDIT_TASK", true)
        },
        emitDeleteProject() {
            this.$emit("deleteTask", this.taskData);
        },
    },
};
</script>
<style lang="scss" scoped>
.red-text {
    color: red !important;
}
</style>
