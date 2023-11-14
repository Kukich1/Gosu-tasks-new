<template>
    <div>
        <MyAppBar :Role="parseInt(Role)" :dataFromServer="dataFromServer" :Name="Name" :logout="logout" @logout="logout">
        </MyAppBar>
        <div>
            <AlertCompleted></AlertCompleted>
            <AlertWorm></AlertWorm>
            <AlertTaskWorm></AlertTaskWorm>
            <AlertTaskCompleted></AlertTaskCompleted>
            <ContainerTasks v-if="this.$store.state.selectedPage === 'accountTasks'" :dataToDialog="dataToDialog"
                @update:dataToDialog="dataToDialog = $event" :dataToModal="dataToModal"
                @update:dataToModal="dataToModal = $event" :Role="parseInt(Role)"></ContainerTasks>

            <ContainerPersonsTasks v-if="this.$store.state.selectedPage === 'allPersonTasks'" :Role="parseInt(Role)">
            </ContainerPersonsTasks>

            <Alert></Alert>
            <AlertSuccess></AlertSuccess>
            <Container v-if="this.$store.state.selectedPage === 'company'" :Role="parseInt(Role)" :archive="archive"
                :tab="tab" :dateRange="dateRange" @update:dateRange="dateRange = $event" @update:tab="tab = $event">
            </Container>

            <div v-if="this.$store.state.selectedPage === 'loading'" class="center">
                <v-progress-circular v-model="tab" indeterminate color="#65b2f0"></v-progress-circular>
            </div>
        </div>

    </div>
</template>

<script>
import Alert from '@/components/UI/Alert.vue';
import AlertSuccess from '@/components/UI/AlertSuccess.vue';
import AlertWorm from '@/components/UI/helps/AlertWorm.vue';
import AlertCompleted from '@/components/UI/helps/AlertCompleted.vue';
import AlertTaskWorm from '@/components/UI/helps/AlertTaskWorm.vue';
import AlertTaskCompleted from '@/components/UI/helps/AlertTaskCompleted.vue';
import MyAppBar from '@/components/MyAppBar.vue';
import ContainerTasks from '@/components/ContainerTasks.vue';
import ContainerPersonsTasks from '@/components/ContainerPersonsTasks.vue';
import Container from '@/components/Container.vue';
import axios from 'axios';
import timestamp from '@/utils/dates';
import { getTimestampEnd, getTimestampStart } from "@/utils/dates";

export default {
    components: {
        MyAppBar,
        Container,
        ContainerTasks,
        ContainerPersonsTasks,
        Alert,
        AlertSuccess,
        AlertWorm,
        AlertCompleted,
        AlertTaskWorm,
        AlertTaskCompleted
    },
    data() {
        const Name = localStorage.getItem('name');
        const clearName = Name.replaceAll('"', '');

        const Role = localStorage.getItem('role');

        const CurrentUser = localStorage.getItem('username');
        const clearCurrentUser = CurrentUser.replaceAll('"', '');
        this.$store.commit("SET_CURRENT_USER", clearCurrentUser);

        return {
            Name: clearName,
            Role: Role,
            tab: 'current',
            drawer: true,
            rail: false,
            dataFromServer: null,
            projectTasks: null,
            taskPosts: null,
            dateRange: this.calculateDateRange(),
            dataToModal: this.calculateDateRange(),
            dataToDialog: this.calculateDateRange(),
            archive: [],
            projects: [],
        };
    },
    watch: {
        async dateRange(vals) {
            this.getArchive(timestamp(vals[0]), timestamp(vals[1])); // [0, 20000], timestamp types
        },
        async dataToModal(val) {
            this.getUserArchive(timestamp(val[0]), timestamp(val[1]))
        },
        async dataToDialog(value) {
            this.getUserArchive(timestamp(value[0]), timestamp(value[1]))
        }
    },
    methods: {
        calculateDateRange() {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();

            // Начальная дата - 1-е число текущего месяца
            const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);

            // Конечная дата - текущее число текущего месяца
            const endOfMonth = new Date(currentYear, currentMonth, today.getDate(), 23, 59, 59, 999);

            return [startOfMonth, endOfMonth];
        },
        projectRemainingTime() {
            if (!this.dataFromServer || this.dataFromServer.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.dataFromServer.map(project => {
                const timeUntilDeadline = project.deadline - currentTime;
                const totalTime = project.deadline - project.created_at;
                const timeRemainingPercentage = (timeUntilDeadline / totalTime) * 100;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 4; // По умолчанию 4 для всех остальных проектов

                if (timeUntilDeadline < 0) {
                    urgency = 1; // Если дедлайн просрочен
                } else if (timeRemainingPercentage <= 25) {
                    urgency = 2; // Если осталось менее 25% времени
                } else if (timeRemainingPercentage <= 50) {
                    urgency = 3; // Если осталось менее 50% времени
                }

                return {
                    project,
                    timeUntilDeadline,
                    timeRemainingPercentage,
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
        taskRemainingTime() {
            if (!this.projectTasks || this.projectTasks.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.projectTasks.map(task => {
                const timeUntilDeadline = task.deadline - currentTime;
                const totalTime = task.deadline - task.created_at;
                const timeRemainingPercentage = (timeUntilDeadline / totalTime) * 100;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 4; // По умолчанию 4 для всех остальных проектов

                if (timeUntilDeadline < 0) {
                    urgency = 1; // Если дедлайн просрочен
                } else if (timeRemainingPercentage <= 25) {
                    urgency = 2; // Если осталось менее 25% времени
                } else if (timeRemainingPercentage <= 50) {
                    urgency = 3; // Если осталось менее 50% времени
                }

                return {
                    task,
                    timeUntilDeadline,
                    timeRemainingPercentage,
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
        postRemainingTime() {
            if (!this.taskPosts || this.taskPosts.length === 0) {
                console.log('Projects array is empty or undefined.');
                return [];
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return this.taskPosts.map(post => {
                const timeUntilDeadline = post.deadline - currentTime;
                const days = Math.floor(timeUntilDeadline / 86400);
                const hours = Math.floor((timeUntilDeadline % 86400) / 3600);
                const minutes = Math.floor(((timeUntilDeadline % 86400) % 3600) / 60);

                let urgency = 4; // По умолчанию 4 для всех остальных проектов

                if (timeUntilDeadline < 604800 && timeUntilDeadline > 0 && days > 3) {
                    // Если осталось менее недели
                    urgency = 3;
                } else if (days < 3 && timeUntilDeadline > 0) {
                    // Если осталось менее 3 дней
                    urgency = 2;
                } else if (timeUntilDeadline < 0) {
                    // Если дедлайн просрочен
                    urgency = 1;
                }

                return {
                    post,
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
        updateTab(newTab) {
            this.tab = newTab;
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('name');
            localStorage.removeItem('username');
            this.$router.push('/');
            this.posts = [];
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
            return {
                headers: {
                    'Authorization': `Bearer ${clearRef}`
                },
            };
        },
        async projectShow() {
            try {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
                this.dataFromServer = response.data;
                this.$store.commit("SET_PROJECTS", this.projectRemainingTime());
                const projectsName = response.data.map(obj => obj?.name);
                this.$store.commit("SET_PROJECT_NAME_LIST", projectsName);
            }
            catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get('https://gosu-tasks-api.vercel.app/company/projects/', this.getToken());
                this.dataFromServer = response.data;
                this.$store.commit("SET_PROJECTS", this.projectRemainingTime());
                const projectsName = response.data.map(obj => obj?.name);
                this.$store.commit("SET_PROJECT_NAME_LIST", projectData);
                console.log('Ошибка обновления токена:', e)
            } finally {

            }
        },
        async getArchive(start, end) {
            const preCommitPage = this.$store.state.selectedPage;
            try {
                this.$store.commit("SET_SELECTED_PAGE", "loading")
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/completed_projects?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                this.archive = response.data.filter(item => item.status === 'completed');
            } catch (error) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                this.$store.commit("SET_SELECTED_PAGE", "loading")

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/company/completed_projects?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                this.archive = response.data.filter(item => item.status === 'completed');
                console.error('Ошибка обновления токена:', error);
            } finally {
                this.$store.commit("SET_SELECTED_PAGE", preCommitPage)
            }
        },
        async userCurrentTasksPosts() {
            try {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/user/get_tasks&posts/', this.getToken());
                console.log(response.data);
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_USER_CURRENT_TASKS", this.taskRemainingTime());
                const currentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_USER_CURRENT_POSTS", this.postRemainingTime());
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get('https://gosu-tasks-api.vercel.app/user/get_tasks&posts/', this.getToken());
                const currentTasks = response.data.filter(item => item.type === 'task');
                this.projectTasks = currentTasks;
                this.$store.commit("SET_USER_CURRENT_TASKS", this.taskRemainingTime());
                const currentPosts = response.data.filter(item => item.type === 'post');
                this.taskPosts = currentPosts;
                this.$store.commit("SET_USER_CURRENT_POSTS", this.postRemainingTime());
                console.log(e);
            } finally {

            }
        },
        async getUserArchive(start, end) {
            try {
                this.$store.commit("SET_LODING_ARCHIVE", true);
                const response = await axios.get(`https://gosu-tasks-api.vercel.app/user/get_completed_tasks&posts?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                const completedTask = response.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get(`https://gosu-tasks-api.vercel.app/user/get_completed_tasks&posts?start=${getTimestampStart(start * 1000)}&end=${getTimestampEnd(end * 1000)}`, this.getToken());
                const completedTask = response.data.filter(item => item.type === 'task');
                this.$store.commit("SET_USER_COMLETED_TASKS", completedTask);
                const completedPost = response.data.filter(item => item.type === 'post');
                this.$store.commit("SET_USER_COMLETED_POSTS", completedPost);
                console.log(e)
            } finally {
                this.$store.commit("SET_LODING_ARCHIVE", false);
            }
        },
        async getUserName() {
            try {
                const response = await axios.get('https://gosu-tasks-api.vercel.app/admin/get_users_list/', this.getToken())
                const username = response.data.map(obj => obj.username)
                this.$store.commit("SET_USERS_NAME", username);
                this.$store.commit("SET_USER_NAME_LST", username);
                this.$store.commit("SET_USERS_NAMES", username);
            } catch (e) {
                const response1 = await axios.post('https://gosu-tasks-api.vercel.app/token/refresh/', undefined, this.getRefreshToken());
                localStorage.removeItem("token")
                localStorage.setItem("token", JSON.stringify(response1.data.access_token));

                const response = await axios.get('https://gosu-tasks-api.vercel.app/admin/get_users_list/', this.getToken())
                const username = response.data.map(obj => obj.username)
                this.$store.commit("SET_USERS_NAME", username)
                this.$store.commit("SET_USER_NAME_LST", username)
                console.log('Ошибка обновления токена:', e)
            } finally {

            }

        },
    },
    async mounted() {
        await this.userCurrentTasksPosts();
        await this.getUserName();
        await this.projectShow();
        this.$store.commit("SET_SELECTED_PAGE", "company")

        function getDates(remainingTime) {
            const dates = [{}, ...remainingTime()].reduce((acc, project) => {
                acc[project.project.id] = {
                    days: project?.remainingDays,
                    hours: project?.remainingHours,
                    minutes: project?.remainingMinutes
                };
                return acc;
            })
            return dates;
        }

        const dates = getDates(this.projectRemainingTime);
        this.$store.commit("SET_DATES", dates);

        setInterval((remainingTime) => {
            const dates = getDates(remainingTime);
            this.$store.commit("SET_DATES", dates);
        }, 60000, this.projectRemainingTime);

        this.getUserArchive(timestamp(this.dataToModal[0]), timestamp(this.dataToModal[1]));
        this.getArchive(timestamp(this.dateRange[0]), timestamp(this.dateRange[1]));


    },
}
</script>

<style lang="scss" scoped>
.center {
    max-width: 100px;
    max-height: 100px;
    position: absolute;
    top: 50%;
    left: 50%
}
</style>    