<template>
    <!-- <div>
        <pre>{{ projects }}</pre>
    </div> -->
    <v-card>
        <v-tabs align-tabs="title" grow @update:model-value="this.$emit('update:tab', $event)" :model-value="tab">
            <v-tab value="current">Проекты</v-tab>
            <v-tab value="completed">Архив</v-tab>
        </v-tabs>

        <v-card-text style="height: calc(100vh - 176px); overflow-y: scroll;">
            <v-window :model-value="tab" v-on:update:model-value="this.$emit('update:tab', $event)">
                <v-window-item value="current">
                    <v-row>
                        <v-col v-for="projectData in this.$store.state.projects" :key="projectData?.id" cols="4"
                            style="padding:20px" class="scrollable-container">
                            <v-card v-if="projectData.project" @click="openDialogProject(projectData)"
                                :class="getCardClass(projectData)" class="ma-2 pa-2" block rounded-lg
                                style="min-height: 375px; border-radius: 20px;">
                                <!-- <div class="card-image"
                                style="background-image: src='../IMG/resource.png'; 
                                background-position: top; background-size: cover;"> -->
                                    <v-card-title>{{ projectData.project.name }}</v-card-title>
                                    <v-card-subtitle>{{ projectData.project.description }}</v-card-subtitle>
                                    <br/>
                                    <br/>
                                    <v-divider></v-divider>
                                    <br />
                                    <br />
                                    <v-progress-linear model-value="10" color="light-blue" height="10"
                                        striped></v-progress-linear>
                                    <br />
                                    <br />
                                    <v-card-text>
                                        <div class="deadline-info">
                                            <strong>{{ projectData.timeUntilDeadline > 0 ? 'Дедлайн через' : 'Дедлайн был'
                                            }}</strong>
                                            <div>
                                                <div class="deadline-values">
                                                    <p>Дней:</p>{{ projectData.remainingDays }}
                                                </div>
                                                <div class="deadline-values">
                                                    <p>Часов:</p>{{ projectData.remainingHours }}
                                                </div>
                                                <div class="deadline-values">
                                                    <p>Минут:</p>{{ projectData.remainingMinutes }}
                                                </div>
                                            </div>
                                        </div>
                                    </v-card-text>
                            </v-card>
                            <ProjectDialog :Role="Role" :projectShow="projectShow"
                                @update:dialog="projectData.dialog = $event" :dialog="projectData.dialog"
                                :projectData="projectData" @edit:dialog="EditShow" ref="projectDialog">
                            </ProjectDialog>
                        </v-col>
                        <ProjectEdit :projectShow="projectShow"></ProjectEdit>
                    </v-row>
                </v-window-item>
                <v-window-item value="completed" style="height: 500px;" class="scrollable-container">
                    <v-row>
                        <v-col cols="12" style="padding:20px">
                            <Datepicker :model-value="this.dateRange"
                                @update:model-value="this.$emit('update:dateRange', $event)" range :maxDate="new Date()"
                                :enableTimePicker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                                :startTime="[{ hours: 0, minutes: 0 }, { hours: 23, minutes: 59 }]" :clearable="false"
                                class="custom-datepicker" style="width: 100%;" />
                        </v-col>
                        <v-col block class="ma-2" v-if="archive.length > 0" v-for="item in archive" :key="item.id" cols="4">
                            <v-card block @click="openDialogArchive(item)" class="ma-2 pa-2" style="min-height: 375px; border-radius: 20px; border: 2px solid #00E676;">
                                <v-card-title>{{ item.name }}</v-card-title>
                                <v-card-subtitle>{{ item.description }}</v-card-subtitle>
                                <br/>
                                <br/>
                                <v-divider></v-divider>
                                <br/>
                                <br/>
                                <v-card-text>{{ item.time_completed }}</v-card-text>
                            </v-card>
                            <ArchiveDialog :dialog="item.dialog" @update:dialog="item.dialog = $event" :item="item"></ArchiveDialog>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import ProjectDialog from '@/components/ProjectDialog.vue'
import ProjectEdit from '@/components/ProjectEdit.vue'
import ArchiveDialog from '@/components/helps/ArchiveDialog.vue'

export default {
    async created() {
        this.projects = this.$store.state.projects;
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
        ProjectEdit,
        ArchiveDialog,
    },
    data() {
        return {
            projects: [],
            showProjectDialog: false,
            selectedProjectData: null,
            eidtDialog: false,
        };
    },
    methods: {
        EditShow(newValue) {
            this.eidtDialog = newValue
            this.$emit('edit:dialog', this.eidtDialog)
        },
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
        openDialogProject(projectData) {
            projectData.dialog = true;
            this.selectedProjectData = projectData;
        },
        openDialogArchive(item){
            item.dialog = true;
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
.card-image {
    background-size: cover;
    background-position: top;
    height: 100px;
}

.deadline-info {
    align-items: flex-end;
    height: 100%;
    columns: 1;
}

.deadline-values {
    display: flex;
    justify-content: space-between;
}

.progress {
    height: 100%;
    background-color: #65B2F0;
    /* Цвет полосы прогресса */
}

.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
    border-radius: 10px;
    overflow: hidden;
}

.red-card {
    border: 2px solid red;
}

.yellow-card {
    border: 2px solid yellow;
}

.custom-datepicker {
    width: 50vh;
}

</style>