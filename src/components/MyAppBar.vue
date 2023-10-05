<template>
    <div>
        <v-app-bar color="white" prominent>
            <v-img src="../IMG/gosu_full_traced1.svg" height="50" contain></v-img>
            <div v-if="Role === 1">
                <ProjectCreate :disabled="!this.dataFromServer" :projectShow="this.projectShow" />
            </div>
        </v-app-bar>
    </div>
</template>

<script>
import ProjectCreate from '@/components/ProjectCreate.vue';


export default {

    components: {
        ProjectCreate,
    },
    props: {
        Role: Number,
        dataFromServer: Array,
        projectShow: Function,
    },
    methods: {
    },

}
</script>

<style lang="scss" scoped></style>