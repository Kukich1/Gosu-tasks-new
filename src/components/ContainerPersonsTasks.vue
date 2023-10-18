<template>
    <div>FFFFFFFFFFFFFF
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-tabs v-model="tab" align-tabs="title" grow>
                        <v-tab value="incoming">Все задание</v-tab>
                        <v-tab value="current">Все задачи</v-tab>
                        <v-tab value="completed">Выполненные задание</v-tab>
                    </v-tabs>

                    <v-card-text>
                        <v-window v-model="tab">
                            <v-window-item value="incoming">
                                <v-card>
                                    <v-card-text></v-card-text>
                                </v-card>
                            </v-window-item>
                            <v-window-item value="current">
                                <v-card>
                                    <v-card-text></v-card-text>
                                </v-card>
                            </v-window-item>
                            <v-window-item value="completed">
                                <v-card>
                                    <v-card-text></v-card-text>
                                </v-card>
                            </v-window-item>
                        </v-window>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    export default {
        props:{
            Role: Number,
        }
    }
</script>

<style lang="scss" scoped>

</style>