<template>
    <v-container>
        <v-card>
            <v-tabs :value="this.tab" align-tabs="title" grow @input="$emit('update:tab', $event)">
                <v-tab value="current">Проекты</v-tab>
                <v-tab value="completed">Архив</v-tab>
            </v-tabs>

            <v-card-text>
                <v-window :value="tab">
                    <v-window-item value="current">
                        <v-row>
                            <v-col v-for="projectData in projects" :key="projectData.project?.id" cols="4"
                                style="height: 500px;" class="scrollable-container">
                                <v-card block class="ma-2 pa-2" @click="">
                                    <template v-slot:title>{{ projectData.project.name }}</template>
                                    <template v-slot:subtitle>{{ projectData.project.description }}</template>
                                    <template v-slot:text v-if="projectData.project.timeUntilDeadline > 0">Дедлайн через {{
                                        projectData.remainingDays }} дней, {{ projectData.remainingHours }} часов и {{
        projectData.remainingMinutes }} минут</template>
                                    <template v-slot:text v-else>Дедлайн был {{ projectData.remainingDays }} дней, {{
                                        projectData.remainingHours }} часов и {{ projectData.remainingMinutes}} минут
                                        назад</template>
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
                                <v-card block class="ma-2 pa-2">
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
export default {
  props: {
    tab: String,
    projects: Array,
    archive: Array,
    dateRange: Array,
  },
  methods: {
    updateTab(newTab) {
      // Update the tab value when the user switches tabs
      this.tab = newTab;
    },
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