<template>
    <div>
        <v-container>
            <ContainerCompany v-if="this.$store.state.selectedPage === 'company'" :Role="parseInt(Role)"
                :archive="this.archive" :tab="tab" :dateRange="dateRange"
                @update:dateRange="this.$emit('update:dateRange', $event)" @update:tab="this.$emit('update:tab', $event)">
            </ContainerCompany>
        </v-container>
    </div>
</template>

<script>
import ContainerCompany from '@/components/ContainerCompany.vue';

export default {
    components: {
        ContainerCompany,
    },
    props: {
        Role: Number,
        archive: Array,
        dateRange: Array,
        tab: String,
    },
}
</script>

<style lang="scss" scoped></style>