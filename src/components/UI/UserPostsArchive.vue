<template>
    <div class="modal-container" :class="{ 'modal-open': isOpen }">
        <div class="modal">
            <v-container @click.stop>
                <div class="padding_top">
                    <div style="display:flex; justify-content: space-between;">
                        <v-btn icon white @click="closeModal" class="font-weight-medium">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <div>Подзадачи</div>
                    </div>
                    <Datepicker :model-value="this.dataToDialog"
                        @update:model-value="this.$emit('update:dataToDialog', $event)" range :max-date="new Date()"
                        :enable-time-picker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                        :start-time="[{ hours: 0, minutes: 0, seconds: 1 }, { hours: 23, minutes: 59, seconds: 59 }]"
                        :clearable="false" class="custom-datepicker" style="width: 100%;" />
                    <div class="scrollable-content" style="max-height: 80vh; overflow-y: auto;">
                        <v-col block v-if="$store.state.user_completed_tasks.length > 0"
                            v-for="postData in this.$store.state.user_completed_posts" :key="postData.id" class="">
                            <div v-if="!this.$store.state.lodingArchive">
                                <v-card block @click="openDialogPost(postData)" class="ma-2 pa-2"
                                    style="min-height: 100px; border-radius: 20px; border: 2px solid limegreen;">
                                    <v-card-title>{{ postData.name }}</v-card-title>
                                    <v-card-subtitle>{{ postData.description }}</v-card-subtitle>
                                    <br />
                                    <v-divider></v-divider>
                                    <br />
                                    <v-card-text>
                                        <div class="project-name">
                                            <strong>Задача:</strong>
                                            {{ postData.task_name }}
                                        </div>
                                    </v-card-text>
                                    <v-card-text>
                                        <div class="deadline-info">
                                            <strong>Дата завершения:</strong>
                                            {{ formattedDate(postData.time_completed) }}
                                        </div>
                                    </v-card-text>
                                </v-card>
                                <SubTaskCompleted :postData="postData" :dialog="postData.dialog"
                                    @update:dialog="postData.dialog = $event" :Role="Role">
                                </SubTaskCompleted>
                            </div>
                        </v-col>
                        <v-col cols="12" v-else justify="center" align="center" class="text-h3 center"
                            style="margin-top: 50%">
                            <div v-if="!this.$store.state.lodingArchive">
                                Пусто
                            </div>
                        </v-col>
                        <div v-if="this.$store.state.lodingArchive" class="center_loding">
                            <v-progress-circular indeterminate color="#65b2f0"></v-progress-circular>
                        </div>
                    </div>
                </div>
            </v-container>
        </div>
    </div>
</template>
  
<script>
import SubTaskCompleted from '@/components/UI/helps/SubTaskCompleted.vue'
import axios from 'axios';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { getTimestampEnd, getTimestampStart } from "@/utils/dates";
import { Store } from 'vuex';
export default {
    components: {
        Datepicker,
        SubTaskCompleted,
    },
    props: {
        dataToDialog: Boolean,
    },
    data() {
        return {
            isOpen: false,
        };
    },
    methods: {
        formattedDate(time_completed) {
            if (time_completed) {
                const timestampInMilliseconds = time_completed * 1000;
                const date = new Date(timestampInMilliseconds);
                return date.toLocaleString();
            }
            return '';
        },
        openDialogPost(postData) {
            postData.dialog = true;
            this.selectedProjectData = postData;
        },
        openModal() {
            this.isOpen = true;
        },
        closeModal() {
            this.isOpen = false;
        },
    },
};
</script>
  
<style scoped>

.modal-container {
    position: fixed;
    top: 64px;
    right: -25%;
    width: 25%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    transition: right 0.5s ease;
    z-index: 1000;
}

.modal {
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 0.5rem;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
}

.modal-open {
    right: 0;
}

.center_loding {
    position: absolute;
    top: 50%;
    left: 50%;
}
</style>