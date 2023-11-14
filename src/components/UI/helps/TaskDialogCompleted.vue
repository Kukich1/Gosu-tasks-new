<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="1200"
                    @click:outside="closeDialog" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <div class="d-flex justify-space-between align-center">

                                </div>
                                <v-toolbar dark color="light-green-accent-1">
                                    <v-spacer></v-spacer>
                                    <v-card-title class="text-truncate text-h4 font-weight-medium"
                                        style="color: black; font-family: 'Gilroy';">{{ taskData.name }}
                                    </v-card-title>
                                    <v-spacer></v-spacer>
                                </v-toolbar>
                                <div class="d-flex">
                                    <div class="d-flex flex-column" style="padding:26px; font-family: 'Montserrat';">
                                        <div class="section">
                                            <div class="section-header">
                                                <v-icon class="section-icon">mdi-calendar-clock</v-icon>
                                                <strong>Сроки</strong>
                                            </div>
                                            <div class="section-content w-50">
                                                <table>
                                                    <tr v-if="taskData.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.time_completed">
                                                        <td><strong>Завершон:</strong></td>
                                                        <td>{{ formatTimestamp(taskData.time_completed) }}</td>
                                                    </tr>
                                                    <tr v-if="taskData.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in taskData.archive_deadline">{{
                                                            formatTimestamp(deadline) }}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>

                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon>Задача для:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip v-for="(member, index) in taskData.members" :key="index"
                                                    color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>

                                    <v-card-text class="flex-column w-50">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ taskData.description }}</pre>
                                        </div>
                                    </v-card-text>
                                </div>
                                <div v-if="isLoadingPost"
                                    style="display: flex; justify-content: center; align-items: center; padding:26px">
                                    <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                                </div>
                                <div v-if="!isLoadingPost && this.$store.state.postsCompleted.length > 0">
                                    <div class="d-flex" style="padding:26px; font-family:'Montserrat';">
                                        <v-row class="row-width">
                                            <v-col v-for="postData in this.$store.state.postsCompleted"
                                                :key="postData.id" cols="4">
                                                <v-card @click="openDialogPost(postData)" class="pa-2"
                                                    :class="CardClass(postData)" block rounded-lg
                                                    style="min-height: 175px; border-radius: 20px;">
                                                    <v-card-title class="fs-14">{{ postData.name
                                                    }}</v-card-title>
                                                    <v-card-subtitle class="pb-2"> {{ postData.description
                                                    }}</v-card-subtitle>
                                                    <br />
                                                    <v-divider></v-divider>
                                                    <br />
                                                    <v-card-text>{{ formatTimestamp(postData.time_completed) }}
                                                        <v-icon style="left: 10px;"
                                                            color="green">mdi-check-circle</v-icon>
                                                    </v-card-text>
                                                </v-card>
                                                <SubTaskCompleted :postData="postData" :dialog="postData.dialog"
                                                    @update:dialog="postData.dialog = $event" :Role="Role">
                                                </SubTaskCompleted>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </div>
                                <div v-else>
                                    <div v-if="!isLoadingPost"
                                        style="display: flex; justify-content: center; align-items: center; padding:26px">
                                        <strong class="text-h5">Подзадачи не назначены</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import SubTaskCompleted from '@/components/UI/helps/SubTaskCompleted.vue'

export default {
    components: {
        SubTaskCompleted,
    },
    props: {
        dialog: Boolean,
        taskData: Object,
        isLoadingPost: Boolean,
    },
    data() {
        return {

        }
    },
    methods: {
        openDialogPost(postData) {
            postData.dialog = true;
            this.selectedProjectData = postData;
        },
        closeDialog() {
            console.log('CLOSE COMPLETED_TASK')
            this.$emit('update:dialog', false);
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
        },
        CardClass(taskData) {
            const cardClass = {
                'ma-2': true,
                'mt-5': true,
            };
            if (taskData.urgency == 1) {
                cardClass['red-card'] = true;
            } else if (taskData.urgency == 2) {
                cardClass['orange-card'] = true;
            } else if (taskData.urgency == 3) {
                cardClass['yellow-card'] = true;
            } else if (taskData.urgency == undefined) {
                cardClass['green-card'] = true;
            }
            return Object.keys(cardClass).join(" ");
        },
    },
}
</script>

<style lang="scss" scoped>
.v-dialog.v-dialog--active::before {
    background-color: rgba(0, 0, 0, 0.01);
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 90%;
}

.participants {
    margin-top: 20px;
    /* Отступ сверху для раздела "Участники" */
}

.pre-description {
    max-height: 500px;
    padding: 10px;
    font-family: 'Times New Roman', serif;
    /* Добавлен отступ сверху */
}

.pre-description-text {
    white-space: pre-wrap;
    overflow-x: auto;
    max-width: 100%;
    max-height: 500px;
    border: 1px solid white;
    padding: 10px;
    font-family: 'Times New Roman', serif;
}

.red-card {
    border: 2px solid red;
}

.orange-card {
    border: 2px solid orange;
}

.yellow-card {
    border: 2px solid yellow;
}

.green-card {
    border: 2px solid limegreen;
}
</style>