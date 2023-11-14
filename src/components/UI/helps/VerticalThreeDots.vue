<template>
    <div>
        <v-menu v-model="menu" offset-y>
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
            </template>

            <v-list>
                <v-list-item @click="emitEditDialog(projectData.project.id)">Edit</v-list-item>
                <v-list-item class="red-text" @click="emitDeleteProject(this.projectData)">Delete</v-list-item>
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
        projectData: Object,
    },
    methods: {
        emitEditDialog() {
            this.$emit("editDialog",true)
            this.$emit("editProject", this.projectData)
            this.$store.commit("SET_PROJECT_EDIT",this.projectData)
            this.$store.commit("SET_SHOW_EDIT_PROJECT", true)
        },
        emitDeleteProject() {
            this.$emit("deleteProject", this.projectData);
            console.log('delete true!!!!')
        },
    },
};
</script>

<style lang="scss" scoped>
.red-text {
    color: red !important;
}
</style>    