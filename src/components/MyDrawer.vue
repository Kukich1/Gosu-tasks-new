<template>
    <div>
        <v-navigation-drawer :value="drawer" :rail="rail" permanent @click="rail = false">

            <v-list-item class="pa-2" prepend-avatar="https://randomuser.me/api/portraits/men/80.jpg" :title="Name" nav>
                <template v-slot:append>
                    <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
                </template>
            </v-list-item>

            <v-divider></v-divider>

            <v-list density="compact" nav>

                <v-list-item prepend-icon="mdi-home-city" title="Компания" value="company"
                    v-bind:disabled="!this.dataFromServer" @click="showContainer('company')"></v-list-item>


                <div v-if="Role === 1">
                    <v-list-item prepend-icon="mdi-account" title="Пользователи и задачи" value="tasks"
                        v-bind:disabled="!this.dataFromServer" @click="showContainer('tasks')"></v-list-item>
                </div>

                <div v-else>
                    <v-list-item prepend-icon="mdi-account" title="Личные задачи" value="account"
                        v-bind:disabled="!this.dataFromServer" @click="showContainer('tasks')"></v-list-item>
                </div>


            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-list-item color="red" block title="Log Out" prepend-icon="mdi-logout" density="compact"
                        @click="logout" nav></v-list-item>
                </div>
            </template>

        </v-navigation-drawer>
    </div>
</template>

<script>
export default {
    props: {
        Role: Number,
        drawer: Boolean,
        rail: Boolean,
        Name: String,
        dataFromServer: Array,
        showContainer: Function,
        logout: Function,
    },
    methods: {
        showContainer(tabMyDrawer) {
            this.$store.commit("SET_SELECTED_PAGE", tabMyDrawer);
        },
    }
}   
</script>

<style lang="scss" scoped></style>