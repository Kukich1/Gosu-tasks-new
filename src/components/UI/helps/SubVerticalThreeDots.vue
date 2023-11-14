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
        postData: Object,
    },
    methods: {
        emitEditDialog() {
            this.$emit("editDialog",true)
            this.$emit("editProject", this.postData)
            this.$store.commit("SET_EDIT_POST", this.postData)
            this.$store.commit("SET_SHOW_EDIT_POST", true)
        },
        emitDeleteProject() {
            this.$emit("deleteTask", this.postData);
        },
    },
};
</script>
<style lang="scss" scoped>
.red-text {
    color: red !important;
}
</style>