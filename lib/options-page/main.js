import App from './routes/App.svelte';
import namespaces from '../../src/app.config';

const app = new App({
	target: document.body,
	props: {
		namespaces
	}
});

export default app;