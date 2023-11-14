<template>
    <div>
        <v-app-bar app flat color="white" class="myAppBar">
            <div class="button_nav">
                <v-btn icon @click="logout">
                    <v-icon class="red-text">mdi-logout</v-icon>
                </v-btn>
                <v-menu :disabled="!this.dataFromServer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-menu" v-bind="props"></v-btn>
                    </template>
    
                    <v-list>
                        <v-list-item @click="showContainer('company')">
                            <div style="display: flex;">
                                <v-list-item-icon>
                                    <v-icon>mdi-home-city</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title style="margin-left:10px;">Компания</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="showContainer('allPersonTasks')" v-if="Role === 1">
                            <div style="display: flex;">
                                <v-list-item-icon>
                                    <v-icon>mdi-account</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title style="margin-left:10px;">Участники и цели</v-list-item-title>
                            </div>
                        </v-list-item>
                        <v-list-item @click="showContainer('accountTasks')" v-else>
                            <div style="display: flex;">
                                <v-list-item-icon>
                                    <v-icon>mdi-account</v-icon>
                                </v-list-item-icon>
                                <v-list-item-title style="margin-left:10px;">Личные задачи</v-list-item-title>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>

            <v-img src="@/IMG/tasks1.svg" width="100" height="40" col="6"></v-img>

            <div class="button_create" col="3">
                <div class="project" v-if="Role === 1 && this.$store.state.selectedPage === 'company'">
                    <ProjectCreate :disabled="!this.dataFromServer" />
                </div>
                <div v-else-if="Role === 1 && this.$store.state.selectedPage === 'allPersonTasks'">
                    <TaskCreate :disable="!this.dataFromServer" />
                </div>
                <div v-else-if="Role === 0 && this.$store.state.selectedPage === 'accountTasks'">
                    <PostCreate :disable="!this.dataFromServer" />
                </div>
            </div>
        </v-app-bar>
    </div>
</template>

<script>
import ProjectCreate from '@/components/UI/ProjectCreate';
import TaskCreate from '@/components/UI/helps/TaskCreate';
import PostCreate from '@/components/UI/helps/PostCreate';


export default {
    components: {
        ProjectCreate,
        TaskCreate,
        PostCreate,
    },
    props: {
        Role: Number,
        editDialog: Boolean,
        dataFromServer: Array,
    },
    methods: {
        yourMenuItemFunction(item) {
            // Здесь можно добавить логику для обработки выбранного пункта меню
            console.log(`Выбран пункт меню: ${item}`);
        },
        showContainer(tabMyDrawer) {
            this.$store.commit("SET_SELECTED_PAGE", tabMyDrawer);
        },
        logout() {
            this.$emit('logout', true)
        },
    }
}
</script>

<style lang="scss" scoped>
.myAppBar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
}

.myAppBarLeft {
    display: flex;
    align-items: center;
}

.v-btn {
    margin-right: 10px;
    font-size: 16px;
    margin-left: 5px;
}

.v-icon {
    margin-right: 4px;
}
.red-text {
    color: red !important;
}
.button_nav {
    width:175px;
}
.button_create {
    width: 175px;
}
</style>