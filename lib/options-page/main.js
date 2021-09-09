import App from './routes/App.svelte';
import namespaces from '../../app.config';

const app = new App({
	target: document.body,
	props: {
		namespaces
	}
});

export default app;