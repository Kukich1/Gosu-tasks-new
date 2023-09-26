<template>
    <v-card>
        <v-layout>

            <my-drawer :drawer="drawer" :rail="rail" :Name="Name" :dataFromServer="dataFromServer"
                :showContainer="showContainer" :logout="logout"></my-drawer>

            <my-app-bar :Role="Role" :dataFromServer="dataFromServer"></my-app-bar>

            <v-main style="height: 100vh">

                <v-container v-model="tab" v-if="this.selectedContainer === 'loading'"
                    style="display: flex; justify-content: center; align-items: center; height: 100%;">
                    <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                </v-container>

                <v-container v-if="selectedContainer === 'company'">
                    <company-container :tab="tab" @update:tab="tab = $event" :projects="projects" :archive="archive" :dateRange="dateRange"></company-container>
                </v-container>

                <v-container v-if="this.selectedContainer === 'account'">
                    <v-row>
                        <v-col cols="12">
                            <v-card>
                                <v-tabs v-model="tab" align-tabs="title" grow>
                                    <v-tab>Все задание</v-tab>
                                    <v-tab>Все задачи</v-tab>
                                    <v-tab>Выполненные задание</v-tab>
                                </v-tabs>

                                <v-card-text>
                                    <v-window v-model="tab">
                                        <v-window-item value="projects">
                                            <v-card flat>
                                                <v-card-text></v-card-text>
                                            </v-card>
                                        </v-window-item>
                                        <v-window-item value="archive">
                                            <v-card flat>
                                                <v-card-text></v-card-text>
                                            </v-card>
                                        </v-window-item>
                                    </v-window>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
            </v-main>
        </v-layout>
    </v-card>
</template>

<script>
import axios from 'axios';
import AddNewProject from '@/components/AddNewProject.vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { ru } from 'date-fns/locale';
import MyDrawer from '@/components/MyDrawer.vue';
import MyAppBar from '@/components/MyAppBar.vue';
import CompanyContainer from '@/components/CompanyContainer.vue'

export default {
    components: {
        AddNewProject,
        Datepicker,
        MyDrawer,
        MyAppBar,
        CompanyContainer,
    },
    data() {
        const Name = localStorage.getItem('name');
        const clearName = Name.replaceAll('"', '');

        const Role = localStorage.getItem('role');

        function formatDate(date) {
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            return new Date(date).toLocaleDateString(undefined, options);
        }

        const currentDate = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000);
        const date = currentDate.toISOString().substr(0, 10);
        const dateFormatted = formatDate(date);

        return {
            Name: clearName,
            Role: Role,
            tab: null,
            drawer: true,
            rail: false,
            selectedContainer: "loading",
            dataFromServer: [],
            projects: [],
            dateRange: this.calculateDateRange(),
            archive: [],
            type: null,
            date: date,
            dateFormatted: dateFormatted,
            menu1: false,
            menu2: false,
            computedDateFormatted: null,
        };
    },
    computed: {
        computedDateFormatted() {
            return this.formatDate(this.date)
        },
    },
    watch: {
        async dateRange(vals) {
            this.getArchive();
        },
        async dataFromServer(vals) {
            console.log(vals);
        },
        async isModalOpen(vals) {
            this.projectShow();
        }
    },
    methods: {
        calculateDateRange() {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            const startOfDay = new Date(sevenDaysAgo);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            return [startOfDay, endOfDay];
        },
        remainingTime() {
            if (!this.dataFromServer || this.dataFromServer.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            return this.dataFromServer.map(project => {
                const currentTime = Math.floor(Date.now() / 1000);
                const timeUntilDeadline = project.deadline - currentTime;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);
                return {
                    project,
                    timeUntilDeadline,
                    remainingDays: Math.abs(days),
                    remainingHours: Math.abs(hours),
                    remainingMinutes: Math.abs(minutes)
                };
            });
        },
        getConfig() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
        },
        async projectShow() {
            try {
                const response = await axios.get('https://gosutasks-api.vercel.app/company/projects/', this.getConfig());
                this.dataFromServer = response.data;
                this.projects = dataFromServer.filter(item => item.status === 'current');
            }
            catch {
            }
        },
        async getArchive() {
            try {
                const response = await axios.get('https://gosutasks-api.vercel.app/company/completed_projects', this.getConfig());
                this.archive = response.data.filter(item => item.status === 'completed');
            } catch {

            }
        },
        showContainer(value) {
            this.selectedContainer = value;
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('name');
            this.$router.push('/');
            this.posts = [];
        },
    },
    async mounted() {
        await this.projectShow();
        this.selectedContainer = 'company';
        this.projects = this.remainingTime();
        setInterval(() => {
            this.projects = this.remainingTime();
        }, 60000);
        this.getArchive();
    },
}
</script>

<style lang="scss" scoped>
.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
}
</style>