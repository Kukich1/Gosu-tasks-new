<template>
    <v-card>
        <v-layout>

            <my-drawer :Role="parseInt(Role)" :drawer="drawer" :rail="rail" :Name="Name" :dataFromServer="dataFromServer"
                :showContainer="showContainer" :logout="logout"></my-drawer>

            <my-app-bar :Role="parseInt(Role)" :dataFromServer="dataFromServer" :projectShow="projectShow"
                :editDialog="editDialog"></my-app-bar>

            <v-main style="height: 100vh">

                <v-container v-model="tab" v-if="this.$store.state.selectedPage === 'loading'"
                    style="display: flex; justify-content: center; align-items: center; height: 100%;">
                    <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                </v-container>

                <v-container v-if="this.$store.state.selectedPage === 'company'">
                    <ContainerCompany :Role="parseInt(Role)" :projectShow="projectShow" :projects="projects"
                        :archive="archive" :tab="tab" :dateRange="dateRange" @update:dateRange="dateRange = $event"
                        @update:tab="tab = $event" @open-modal="openProjectModal" @edit:dialog="EditShow">
                    </ContainerCompany>
                </v-container>

                <v-container v-if="this.$store.state.selectedPage === 'allPersonTasks'">
                    <ContainerPersonsTasks></ContainerPersonsTasks>
                </v-container>

                <v-container v-if="this.$store.state.selectedPage === 'accountTasks'">
                    <ContainerTasks></ContainerTasks>
                </v-container>

            </v-main>
        </v-layout>
    </v-card>
</template>

<script>
import axios from 'axios';
import ProjectCreate from '@/components/ProjectCreate.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyAppBar from '@/components/MyAppBar.vue';
import ContainerCompany from '@/components/ContainerCompany.vue'
import ContainerTasks from '@/components/ContainerTasks.vue'
import timestamp from '@/utils/timestamp';
import ContainerPersonsTasks from '@/components/ContainerPersonsTasks.vue'

export default {
    components: {
        ProjectCreate,
        MyDrawer,
        MyAppBar,
        ContainerCompany,
        ContainerTasks,
        ContainerPersonsTasks,
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
            tab: 'current',
            drawer: true,
            rail: false,
            dataFromServer: null,
            projects: [],
            projectname: [],
            dateRange: this.calculateDateRange(),
            archive: [],
            type: null,
            date: date,
            dateFormatted: dateFormatted,
            selectedProject: null,
            editDialog: false,
        };
    },
    computed: {
        computedDateFormatted() {
            return this.formatDate(this.date)
        },
    },
    watch: {
        async dateRange(vals) {
            this.getArchive(timestamp(vals[0]), timestamp(vals[1])); // [0, 20000], timestamp types
        },
        async dataFromServer(vals) {
        },
        async isModalOpen(vals) {
            this.projectShow();
        }
    },
    methods: {
        EditShow(newValue) {
            this.editDialog = newValue;
        },
        openProjectModal(projectData) {
            this.selectedProject = projectData;
        },
        closeProjectModal() {
            this.selectedProject = null;
        },
        updateTab(newTab) {
            this.tab = newTab;
        },
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
        projectRemainingTime() {
            if (!this.dataFromServer || this.dataFromServer.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.dataFromServer.map(project => {
                const timeUntilDeadline = project.deadline - currentTime;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 3; // По умолчанию 3 для всех остальных проектов

                if (timeUntilDeadline < 604800 && timeUntilDeadline > 0) {
                    // Если осталось менее недели
                    urgency = 2;
                } else if (timeUntilDeadline < 0) {
                    // Если дедлайн просрочен
                    urgency = 1;
                }

                return {
                    project,
                    timeUntilDeadline,
                    remainingDays: Math.abs(days),
                    remainingHours: Math.abs(hours),
                    remainingMinutes: Math.abs(minutes),
                    urgency,
                }
            }).sort((a, b) => {
                // Сортировка по уровню срочности и времени до дедлайна
                if (a.urgency !== b.urgency) {
                    return a.urgency - b.urgency;
                }
                if (a.urgency === 1) {
                    return -1;
                } else if (b.urgency === 1) {
                    return 1;
                }
                return a.timeUntilDeadline - b.timeUntilDeadline;
            });
        },
        getToken() {
            const token = localStorage.getItem("token");
            const cleanToken = token.replaceAll("\"", "");
            return {
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
            };
        },
        getRefreshToken() {
            const refresh_token = localStorage.getItem("refresh_token");
            const clearRef = refresh_token.replaceAll("\"", "");
            let config2 = {
                headers: {
                    'Authorization': `Bearer ${clearRef}`
                },
            };
        },
        async projectShow() {
            try {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
                this.dataFromServer = response.data;
                this.projects = this.dataFromServer.filter(item => item.status === 'current');
                this.$store.commit("SET_PROJECTS", this.projectRemainingTime());
                const projectname = response.data.map(obj => obj?.name);
                console.log(projectname)
                this.$store.commit("SET_PROJECTNAME", projectname)
            }
            catch (e) {
                console.log('e', e)
                // const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                // localStorage.removeItem("token")
                // localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                // const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.catchGetToken());
                // this.dataFromServer = response.data;
                // this.projects = dataFromServer.filter(item => item.status === 'current');
            }
        },
        async getArchive(start, end) {
            const preCommitPage = this.$store.state.selectedPage;
            try {
                this.$store.commit("SET_SELECTED_PAGE", "loading")
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/completed_projects?start=${start}&end=${end}`, this.getToken());
                this.archive = response.data.filter(item => item.status === 'completed');
            } catch (error) {
                // console.error('Ошибка обновления токена:', error);
                // const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                // localStorage.removeItem("token")
                // localStorage.setItem("token", JSON.stringify(response1.data.access_token));
                // this.$store.commit("SET_SELECTED_PAGE", "loading")
                // const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/completed_projects?start=${start}&end=${end}`, this.getToken());
                // this.archive = response.data.filter(item => item.status === 'completed');
            } finally {
                this.$store.commit("SET_SELECTED_PAGE", preCommitPage)
            }
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
        console.log('mounted ')
        this.$store.commit("SET_SELECTED_PAGE", "company")
        this.projects = this.projectRemainingTime();
        setInterval(() => {
            this.projects = this.projectRemainingTime();
            this.$store.commit('SET_PROJECTS', this.projectRemainingTime());
        }, 60000);
        this.getArchive(timestamp(this.dateRange[0]), timestamp(this.dateRange[1]));
    },
}
</script>

<style lang="scss" scoped>
.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
}
</style>    