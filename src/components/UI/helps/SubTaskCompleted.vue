<template>
    <div>
        <v-row justify="center">
            <v-col>
                <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" width="600"
                    @click:outside="closeDialog" no-transition>
                    <v-card>
                        <div class="max-h-[90vh] overflow-y-[100vh]">
                            <div class="d-flex flex-column">
                                <v-toolbar :color="getToolbarColor(postData)">
                                    <v-spacer></v-spacer>
                                    <v-card-title class="text-truncate">{{ postData.name }}</v-card-title>
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
                                                    <tr v-if="postData.deadline">
                                                        <td><strong>Дедлайн:</strong></td>
                                                        <td>{{ formatTimestamp(postData.deadline) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.created_at">
                                                        <td><strong>Создано:</strong></td>
                                                        <td>{{ formatTimestamp(postData.created_at) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.time_completed">
                                                        <td><strong>Завершон:</strong></td>
                                                        <td>{{ formatTimestamp(postData.time_completed) }}</td>
                                                    </tr>
                                                    <tr v-if="postData.archive_deadline">
                                                        <td><strong>История дедлайна:</strong></td>
                                                        <td v-for="deadline in postData.archive_deadline">{{
                                                            formatTimestamp(deadline) }}</td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="participants">
                                            <strong><v-icon color="black">mdi-account-multiple</v-icon>Участник:</strong>
                                            <div class="d-flex flex-wrap">
                                                <v-chip color="blue-darken-1" text-color="white" class="mr-2 mt-2">
                                                    {{ postData.member }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </div>
                                    <v-card-text class="flex-column w-50">
                                        <div class="pre-description">
                                            <strong><v-icon color="black">mdi-book</v-icon> Описание:</strong>
                                            <pre class="pre-description-text">{{ postData.description }}</pre>
                                        </div>
                                    </v-card-text>
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

export default {

    props: {
        dialog: Boolean,
        postData: Object,
    },
    data() {
        return {

        }
    },
    methods: {
        formatTimestamp(timestamp) {    
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
        },
        getToolbarColor(postData) {
            const toolbarColor = {};
            if (postData.urgency == 1) {
                toolbarColor['red-accent-1'] = true;
            } else if (postData.urgency == 2) {
                toolbarColor['orange-accent-1'] = true;
            } else if (postData.urgency == 3) {
                toolbarColor['yellow-accent-1'] = true;
            } else if (postData.urgency == 4) {
                toolbarColor['blue-grey-lighten-5'] = true;
            } else if (postData.urgency == undefined) {
                toolbarColor['light-green-accent-1'] = true;
            }
            return Object.keys(toolbarColor).join(" ");
        },
        closeDialog() {
            console.log('Close SubTaskCompleted')
            this.$emit('update:dialog', false);
        },
    },

}
</script>

<style lang="scss" scoped>
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
.red-accent-1 {
    color: red-accent-1;
}

.orange-accent-1 {
    color: orange-accent-1;
}

.yellow-accent-1 {
    color: yellow-accent-1;
}

.blue-grey-lighten-5 {
    color: blue-grey-lighten-5;
}

.light-green-accent-1 {
    color: light-green-accent-1;
}
</style>