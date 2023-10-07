<template>
    <div>
        <v-row justify="center">
            <v-dialog v-model="dialog" persistent width="1024">
                <template v-slot:activator="{ props }">
                    <v-btn color="#65B2F0" v-bind="props" :disabled="this.disabled">
                        <v-icon icon="mdi-plus"></v-icon>Add New Task
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Добавить новый проект</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="project.name" label="Имя Проекта" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="project.description" label="Описания"></v-textarea>
                                </v-col>
                                <v-col style="min-width: 350px;" cols="12" sm="6">
                                    <v-text-field v-model="project.deadline" label="Дедлайн" type="date" required
                                        :rules="[rules.date]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select v-model="project.members" :items="username" chips
                                        label="Выбрать пользователей" multiple
                                        @update:model-value="updateMembers"></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                            Закрыть
                        </v-btn>
                        <v-btn color="blue-darken-1" variant="text" @click="createProject">
                            Сохранить
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
    export default {
        
    }
</script>

<style lang="scss" scoped>

</style>