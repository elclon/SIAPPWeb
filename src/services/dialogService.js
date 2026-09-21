import { createApp, h } from 'vue';
import { DxPopup } from 'devextreme-vue/popup';

const getDomElement = (el) => {
    if (!el) return null;
    if (el instanceof HTMLElement) return el;
    if (el[0] instanceof HTMLElement) return el[0];
    if (el.$el instanceof HTMLElement) return el.$el;
    return null;
};

const dialogService = {
    open(component, props = {}, options = {}) {
        const container = document.createElement('div');
        document.body.appendChild(container);

        let destroyed = false;

        const destroy = (result = null) => {
            if (destroyed) return;
            destroyed = true;

            try {
                app.unmount();
            } catch (e) {
                console.error('Error al desmontar diálogo:', e);
            }

            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }

            if (options.onClose) {
                options.onClose(result);
            }
        };

        const applyPopupStyles = (e) => {
            const content = getDomElement(e.component?.content?.());
            if (content) {
                if (options.paddingCero) {
                    content.style.setProperty('padding', '0px', 'important');
                }
                if (options.overflowHidden) {
                    content.style.setProperty('overflow', 'hidden', 'important');
                }
            }
        };

        const app = createApp({
            data() {
                return {
                    visible: true,
                    result: null
                };
            },
            methods: {
                close(result = null) {
                    this.result = result;
                    this.visible = false;
                    setTimeout(() => {
                        destroy(this.result);
                    }, 250);
                },
                onHiding() {
                    setTimeout(() => {
                        destroy(this.result);
                    }, 250);
                },
                onHidden() {
                    destroy(this.result);
                }
            },
            render() {
                if (!this.visible) {
                    return null;
                }

                const isTitleShown = options.showTitle !== undefined 
                    ? options.showTitle 
                    : (options.showHeader !== false);

                return h(DxPopup, {
                    visible: this.visible,
                    'onUpdate:visible': (val) => {
                        this.visible = val;
                        if (!val) {
                            setTimeout(() => {
                                destroy(this.result);
                            }, 250);
                        }
                    },
                    title: options.title || 'Popup',
                    showTitle: isTitleShown,
                    width: options.width || '50%',
                    height: options.height || 'auto',
                    maxWidth: options.maxWidth || '100%',
                    maxHeight: options.maxHeight || '95vh',
                    position: options.position || { my: 'center', at: 'center', of: window },
                    showCloseButton: options.showCloseButton !== false && isTitleShown,
                    resizeEnabled: options.resizeEnabled !== false,
                    dragEnabled: options.dragEnabled !== false,
                    hideOnOutsideClick: options.hideOnOutsideClick ?? false,
                    animation: options.animation !== undefined ? options.animation : null,
                    wrapperAttr: {
                        class: [
                            options.paddingCero ? 'dialog-padding-cero' : '',
                            options.customClass || ''
                        ].filter(Boolean).join(' ')
                    },
                    onHiding: this.onHiding,
                    onHidden: this.onHidden,
                    onShowing: applyPopupStyles,
                    onShown: applyPopupStyles,
                    onContentReady: (e) => {
                        applyPopupStyles(e);

                        if (options.zIndex) {
                            const content = getDomElement(e.component?.content?.());
                            const wrapper = content ? content.closest('.dx-overlay-wrapper') : null;
                            if (wrapper) {
                                wrapper.style.setProperty('z-index', options.zIndex, 'important');
                                const shader = wrapper.previousElementSibling;
                                if (shader && shader.classList.contains('dx-overlay-shader')) {
                                    shader.style.setProperty('z-index', (options.zIndex - 1).toString(), 'important');
                                }
                            }
                        }
                    }
                }, {
                    default: () => h(component, {
                        ...props,
                        onClose: this.close
                    })
                });
            }
        });

        app.mount(container);
    }
};

export default dialogService;
