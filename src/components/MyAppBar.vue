<template>
    <div>
        <v-app-bar color="white" prominent>
            <v-img src="../IMG/gosu_full_traced1.svg" height="50" contain></v-img>
            <div v-if="Role == 1">
                <AddNewProject :disabled="!this.dataFromServer.length" :get-config="this.getConfig"
                    :project-show="this.projectShow" />
            </div>
        </v-app-bar>
    </div>
</template>

<script>
import AddNewProject from '@/components/AddNewProject.vue';


export default {

    components: {
        AddNewProject,
    },
    props: {
        Role: Number,
        dataFromServer: Array,
    },
    methods: {
        getConfig() {
            // Ваша логика getConfig
        },
        projectShow() {
            // Ваша логика projectShow
        },
    },

}
</script>

<style lang="scss" scoped></style>