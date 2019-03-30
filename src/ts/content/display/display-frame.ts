import { TemplateHandler } from './template-handler';
import { WikiPage } from '../api/page';
import { Set, SortedSet } from '../util/set';

export class WikiFrame {

	private static DEFAULT_WIDTH = 450;
	private static DEFAULT_HEIGHT = 275;

	private _frame: HTMLIFrameElement;
	private _articles: SortedSet<WikiPage>;
	private _disambiguations: SortedSet<WikiPage>;

	private handler: TemplateHandler;

	private _top: number;
	private _left: number;
	private _width: number;
	private _height: number;
	private _visible: boolean;

	constructor() {
		this.handler = new TemplateHandler();
		this._articles = new SortedSet<WikiPage>();
		this._disambiguations = new SortedSet<WikiPage>();

		this._width = WikiFrame.DEFAULT_WIDTH;
		this._height = WikiFrame.DEFAULT_HEIGHT;

		this._frame = document.createElement('iframe');
	}

	prepare(): void {
		this.frame.id = "wikichan";
		this.frame.name = "wikichan";
		this.frame.src = browser.runtime.getURL('frame.html');

		this.frame.frameBorder = "0";
		this.frame.style.width = `${this.width}px`;
		this.frame.style.height = `${this.height}px`;
		this.frame.style.position = 'fixed';

		this.frame.style.visibility = 'hidden';
		this._visible = false;

		document.body.appendChild(this._frame);

		const injectedStyles = document.createElement('link');
		injectedStyles.rel = 'stylesheet';
		injectedStyles.type = 'text/css';
		injectedStyles.href = browser.runtime.getURL('css/wikichan.css');
		document.head.appendChild(injectedStyles);
	}

	update(): void {
		this.clean();

		if (this.disambiguations.elements.length > 0) {
			this.disambiguationsCountContainer.innerText =
				this.disambiguations.elements.length + " disambiguation(s) hidden";

			this.disambiguations.sort();
			this.disambiguations.elements.forEach(d => {
				const div = document.createElement('div');
				div.classList.add('disambiguation');
				div.innerHTML = this.handler.compileDisambiguation(d);
				this.disambiguationsContainer.appendChild(div);
			});
		}

		this.articles.sort();
		this.articles.elements.forEach(a => {
			const div = document.createElement('div');
			div.classList.add("entry");
			div.innerHTML = this.handler.compilePage(a);
			div.getElementsByClassName("hide-button")[0]
				.addEventListener("click", (event) => {
					const button: HTMLElement = <HTMLElement>event.srcElement;
					const header: HTMLElement = button.parentElement.parentElement.parentElement;
					const content: HTMLElement = <HTMLElement>header.nextElementSibling;
					content.style.display = content.style.display === 'none' ? 'block' : 'none';
					button.innerText = button.innerText === '+' ? '–' : '+'

				});
			this.responseContainer.appendChild(div);
		});
	}

	clean(): void {
		this.disambiguationsCountContainer.innerText = "";
		while (this.disambiguationsContainer.lastChild) {
			this.disambiguationsContainer.removeChild(this.disambiguationsContainer.lastChild);
		}

		while (this.responseContainer.lastChild) {
			this.responseContainer.removeChild(this.responseContainer.lastChild);
		}
	}

	open(): void {
		this.frame.style.top = `${this.top}px`;
		this.frame.style.left = `${this.left}px`;
		this.frame.style.visibility = 'visible';
		this._visible = true;

		this.articles.clear();
		this.disambiguations.clear();
	}

	close(): void {
		this.frame.style.visibility = 'hidden';
		this._visible = false;
		this.clean();
	}

	setLocation(x: number, y: number): void {
		const offset = this.calculateOffset(x, y);
		this.top = y + offset.y;
		this.left = x + offset.x;
	}

	calculateOffset(x: number, y: number): { x: number, y: number } {
		let offset = { x: 10, y: 10 };
		if (x + offset.x + this.width > window.innerWidth) {
			offset.x = -(offset.x + this.width);
		}

		if (y + offset.y + this.height > window.innerHeight) {
			offset.y = -(offset.y + this.height);
		}

		return offset;
	}

	addArticle(page: WikiPage): void {
		if (!page.isDisambiguation()) {
			this._articles.add(page);
		} else {
			this._disambiguations.add(page);
		}
	}

	containsPoint(x: number, y: number) {
		return x > this.left && x < this.left + this.width
			&& y > this.top && y < this.top + this.height;
	}

	get documentContainer(): Document {
		return this._frame.contentWindow.document;
	}

	get responseContainer(): HTMLElement {
		return this.documentContainer.getElementById('results');
	}

	get disambiguationsCountContainer(): HTMLElement {
		return this.documentContainer.getElementById('disambiguations-count');
	}

	get disambiguationsContainer(): HTMLElement {
		return this.documentContainer.getElementById('disambiguations-list');
	}

	get top(): number {
		return this._top;
	}

	set top(value: number) {
		this._top = value;
	}

	get left(): number {
		return this._left;
	}

	set left(value: number) {
		this._left = value;
	}

	get height(): number {
		return this._height;
	}

	set height(value: number) {
		this._height = value;
	}

	get width(): number {
		return this._width;
	}

	set width(value: number) {
		this._width = value;
	}

	get frame(): HTMLIFrameElement {
		return this._frame;
	}

	get articles(): SortedSet<WikiPage> {
		return this._articles;
	}

	get disambiguations(): SortedSet<WikiPage> {
		return this._disambiguations;
	}

	get visible(): boolean {
		return this._visible;
	}

}