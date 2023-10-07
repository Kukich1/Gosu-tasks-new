<template>
    <div>
        <v-app-bar color="white">
            <v-img src="../IMG/gosu_full_traced1.svg" height="50" contain ></v-img>
            <div v-if="Role === 1 && this.$store.state.selectedPage === 'company'" >
                <ProjectCreate :disabled="!this.dataFromServer" :projectShow="this.projectShow" />
            </div>
            <div v-else-if="Role === 1 && this.$store.state.selectedPage === 'account'" >
                <TaskCreate :disable="!this.dataFromServer" :taskShow="this.projectTasksShow"/>
            </div> 
        </v-app-bar>
    </div>
</template>

<script>
import ProjectCreate from '@/components/ProjectCreate.vue';
import TaskCreate from '@/components/TaskCreate.vue';


export default {

    components: {
        ProjectCreate,
        TaskCreate,
    },
    props: {
        Role: Number,
        dataFromServer: Array,
        projectShow: Function,
    },
    methods: {
        projectShow(){
            this.projectShow
        },
    },

}
</script>

<style lang="scss" scoped>

</style>