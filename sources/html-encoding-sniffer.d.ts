declare module "html-encoding-sniffer" {
    function sniff(buffer: Buffer, options?: { defaultEncoding?: string; transportLayerEncodingLabel?: string }): string;
    export = sniff;
}
