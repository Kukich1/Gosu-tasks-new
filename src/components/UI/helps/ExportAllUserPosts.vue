<template>
    <div class="modal-container" :class="{ 'modal-open': showDate }">
        <div class="modal">
            <Datepicker :model-value="this.dateRange" @update:model-value="this.$emit('update:dateRange', $event)" range
                :max-date="new Date()" :enable-time-picker="false" locale="ru" select-text="Выбрать" cancel-text="Отменить"
                :start-time="[{ hours: 0, minutes: 0, seconds: 1 }, { hours: 23, minutes: 59, seconds: 59 }]"
                :clearable="false" class="custom-datepicker" style="width: 100%;" />
            <div class="close">
                <v-btn @click="CloseDate" variant="outlined" size="x-small">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script>
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
export default {
    components: {
        Datepicker
    },
    props: {
        showDate: Boolean,
        dateRange: Array,
    },
    data() {
        return {

        }
    },
    methods: {
        CloseDate() {
            this.$emit('update:showDate', false);
        }
    }
}
</script>

<style lang="scss" scoped>
.modal-container {
    position: fixed;
    top: 70px;
    left: -120px;
    width: 260px;
    height: 36px;
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: none;
    display: flex;
    justify-content: flex-start;
    transition: left 0.5s ease;
    z-index: 1001;
}

.modal {
    width: 100%;
    height: 100%;
    background-color: #f4f7fd;
    padding: 0;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
}

.modal-open {
    left: 180px;
}

.close {
    position: absolute;
    right: -40px;
    top: -5px;
}
</style>