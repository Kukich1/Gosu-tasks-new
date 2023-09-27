<template>
    <v-container>
        <v-card>
            <v-tabs align-tabs="title" grow v-model="tab">
                <v-tab value="current">Проекты</v-tab>
                <v-tab value="completed">Архив</v-tab>
            </v-tabs>

            <v-card-text>
                <v-window v-model="tab">
                    <v-window-item value="current">
                        <v-row>
                            <v-col v-for="projectData in projects" :key="projectData.project?.id" cols="4"
                                style="height: 500px;" class="scrollable-container">
                                <v-card block class="ma-2 pa-2" @click="">
                                    <template v-slot:title>{{ projectData.project.name }}</template>
                                    <template v-slot:subtitle>{{ projectData.project.description }}</template>
                                    <template v-slot:text v-if="projectData.project.timeUntilDeadline > 0">Дедлайн через {{projectData.remainingDays }} дней, {{ projectData.remainingHours }} часов и {{projectData.remainingMinutes }} минут</template>
                                    <template v-slot:text v-else>Дедлайн был {{ projectData.remainingDays }} дней, {{projectData.remainingHours }} часов и {{ projectData.remainingMinutes}} минутназад</template>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                    <v-window-item value="completed" style="height: 500px;" class="scrollable-container">
                        <Datepicker v-model="this.dateRange" range :maxDate="new Date()" :enableTimePicker="false"
                            locale="ru" select-text="Выбрать" cancel-text="Отменить" :format-locale="ru"
                            :startTime="[{ hours: 0, minutes: 0 }, { hours: 23, minutes: 59 }]" :clearable="false" />
                        <v-row>
                            <v-col block class="ma-2" v-if="archive.length > 0" v-for="item in archive" cols="4">
                                <v-card block class="ma-2 pa-2" @click="">
                                    <v-card-title :key="item?.id">{{ item?.name }}</v-card-title>
                                    <v-card-text>{{ item?.description }}</v-card-text>
                                </v-card>
                            </v-col>
                            <div>

                            </div>
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
import { ru } from 'date-fns/locale';
export default {
    props: {
        projects: Array,
        archive: Array,
        dateRange: Array,
    },
    components: {
        Datepicker,
    },
    data() {
        return {
            tab: null, // Инициализируем значение по умолчанию
        };
    },
    methods: {
        openModal() {
            // Ваша логика для открытия модального окна
        },
    },
};
</script>

<style lang="scss" scoped>
.scrollable-container {
    overflow-y: auto;
    max-height: 100%;
}
</style>