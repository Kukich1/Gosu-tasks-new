<template>
    <!-- <div>
        <pre>{{ projects }}</pre>
    </div> -->
    <v-container>
        <v-card>
            <v-tabs align-tabs="title" grow @update:model-value="this.$emit('update:tab', $event)" :model-value="tab">
                <v-tab value="current">Проекты</v-tab>
                <v-tab value="completed">Архив</v-tab>
            </v-tabs>

            <v-card-text style="height: calc(100vh - 176px); overflow-y: scroll;">
                <v-window :model-value="tab" v-on:update:model-value="this.$emit('update:tab', $event)">
                    <v-window-item value="current">
                        <v-row>
                            <v-col v-for="projectData in this.$store.state.projects" :key="projectData.project?.id" cols="4"
                                style="margin-block-end: 20px!important; overflow: hidden" class="scrollable-container">
                                <v-card v-if="projectData.project" @click="openDialog(projectData)"
                                    :class="getCardClass(projectData)" class="ma-2 pa-2" block rounded-lg>
                                    <template v-slot:title>{{ projectData.project.name }}</template>
                                    <template v-slot:subtitle>{{ projectData.project.description }}</template>
                                    <template v-slot:text v-if="projectData.timeUntilDeadline > 0">Дедлайн
                                        через
                                        {{ projectData.remainingDays }} дней, {{ projectData.remainingHours }} часов и
                                        {{ projectData.remainingMinutes }} минут</template>
                                    <template v-slot:text v-else>Дедлайн был {{ projectData.remainingDays }} дней,
                                        {{projectData.remainingHours }} часов и {{ projectData.remainingMinutes}}
                                        минут назад</template>
                                </v-card>
                                <ProjectDialog :Role="Role" :projectShow="projectShow" @update:dialog="projectData.dialog = $event"
                                    :dialog="projectData.dialog" :projectData="projectData" ref="projectDialog">
                                </ProjectDialog>
                            </v-col>
                        </v-row>
                    </v-window-item>
                    <v-window-item value="completed" style="height: 500px;" class="scrollable-container">
                        <v-row>
                            <v-col cols="12">
                                <Datepicker :model-value="this.dateRange"
                                    @update:model-value="this.$emit('update:dateRange', $event)" range :maxDate="new Date()"
                                    :enableTimePicker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                                    :startTime="[{ hours: 0, minutes: 0 }, { hours: 23, minutes: 59 }]" :clearable="false"
                                    class="custom-datepicker" style="width: 100%;"/>
                            </v-col>
                            <v-col block class="ma-2" v-if="archive.length > 0" v-for="item in archive" cols="4">
                                <v-card block class="ma-2 pa-2" @click="" color="green-accent-3" rounded-lg>
                                    <v-card-title :key="item?.id">{{ item?.name }}</v-card-title>
                                    <v-card-text>{{ item?.description }}</v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import ProjectDialog from '@/components/ProjectDialog.vue'

export default {
    async created() {
        console.log("this.$store.state.projects", this.$store.state.projects);
        this.projects = this.$store.state.projects;
        console.log("this.projects", this.projects);
    },
    props: {
        Role: Number,
        archive: Array,
        dateRange: Array,
        projectShow: Function,
        tab: String,
    },
    components: {
        Datepicker,
        ProjectDialog,
    },
    data() {
        return {
            projects: [],
            showProjectDialog: false,
            selectedProjectData: null,
        };
    },
    methods: {
        projectShow() {
            this.projectShow()
        },
        getCardClass(projectData) {
            const cardClass = {
                'ma-2': true,
                'pa-2': true,
            };

            if (projectData.urgency == 1) {
                cardClass['red-card'] = true;
            } else if (projectData.urgency == 2) {
                cardClass['yellow-card'] = true;
            }

            return cardClass;
        },
        openDialog(projectData) {
            projectData.dialog = true;
            this.selectedProjectData = projectData;
        },
        "$store.state.projects": function (newVal) {
            console.log(this.projects)
            this.projects = newVal;
            console.log(this.projects)
        }
    },
    watch: {
        selectedProjectData(newVal) {
            console.log(newVal);
        },
        showProjectDialog(newVal) {
            console.log(newVal);
        }
    }
};
</script>

<style lang="scss" scoped>
.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
}

.red-card {
    background-color: red;
}

.yellow-card {
    background-color: yellow;
}

.custom-datepicker {
    width: 50vh
}
</style>