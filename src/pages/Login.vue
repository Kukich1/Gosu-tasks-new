<template>
    <div class="center">
        <v-img class="mx-auto my-6" max-width="228" src="@/IMG/tasks1.svg"></v-img>

        <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">

            <v-form @submit.prevent="onSubmit" v-model="form">

                <div class="text-subtitle-1 text-medium-emphasis">Account</div>

                <v-text-field v-model="username" browserAutocomplete="off" :rules="[required]" density="compact"
                    :readonly="loading" placeholder="Введите ваш логин" prepend-inner-icon="mdi-email-outline"
                    variant="outlined" clearable></v-text-field>

                <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
                    Password
                </div>

                <v-text-field v-model.trim="password" browserAutocomplete="off" :rules="[required]"
                    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
                    density="compact" placeholder="Введите ваш пароль" prepend-inner-icon="mdi-lock-outline"
                    variant="outlined" :readonly="loading" @click:append-inner="visible = !visible"
                    clearable></v-text-field>

                <v-btn :loading="loading" block class="mb-8" color="blue" size="large" variant="tonal" type="submit">
                    Вход
                </v-btn>

            </v-form>
        </v-card>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data: () => ({
        visible: false,
        form: false,
        username: '',
        password: '',
        loading: false,
    }),

    methods: {
        async onSubmit() {
            if (!this.form) return

            try {
                this.loading = true
                const postData = {
                    username: this.username,
                    password: this.password,
                }
                const response = await axios.post('https://gosu-tasks-api.vercel.app/auth/login/', postData)
                localStorage.setItem("token", JSON.stringify(response.data.access_token))
                localStorage.setItem("refresh_token", JSON.stringify(response.data.refresh_token))
                localStorage.setItem("role", JSON.stringify(response.data.role))
                localStorage.setItem("name", JSON.stringify(response.data.name))
                localStorage.setItem("username", JSON.stringify(response.data.username))

                console.log('Добро пожаловать!)')

                const tokenData = response.data;

                if (tokenData.access_token) {
                    this.$router.push('/main');
                }
            } catch (e) {
                console.error(e);
                alert("Логин или Пароль не правильный");
            }
            finally {
                this.loading = false;
            }
        },
        required(v) {
            return !!v || 'Field is required'
        }
    }
}
</script>

<style lang="scss" scoped>
.center{
    position: relative;
    top: 20%;
}
</style>