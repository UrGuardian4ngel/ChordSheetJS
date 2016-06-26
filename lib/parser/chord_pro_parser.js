import ParserBase from './parser_base';
import Song from '../chord_sheet/song';

const NEW_LINE = '\n';
const SQUARE_START = '[';
const SQUARE_END = ']';
const CURLY_START = '{';
const CURLY_END = '}';
const COLON = ':';

export default class ChordProParser extends ParserBase {
  constructor() {
    super();

    this.currentState = this.state('readLyrics', (state) => {
      state.on(NEW_LINE, () => {
        this.song.addLine();
      });

      state.on(SQUARE_START, () => {
        this.song.addItem();
        return this.state('readChords');
      });

      state.on(CURLY_START, () => {
        return this.state('readTagName');
      });

      state.else((chr) => {
        this.song.lyrics(chr);
      });
    });

    this.state('readChords', (state) => {
      state.ignore(NEW_LINE, SQUARE_START);

      state.on(SQUARE_END, () => {
        return this.state('readLyrics');
      });

      state.else((chr) => {
        this.song.chords(chr);
      });
    });

    this.state('readTagName', (state) => {
      state.on(COLON, () => {
        return this.state('readTagValue');
      });

      state.on(CURLY_END, () => {
        this.finishTag();
        return this.state('readLyrics');
      });

      state.else((chr) => {
        this.tagName += chr;
      });
    });

    this.state('readTagValue', (state) => {
      state.on(CURLY_END, () => {
        this.finishTag();
        return this.state('readLyrics');
      });

      state.else((chr) => {
        this.tagValue += chr;
      });
    });
  }

  finishTag() {
    this.debug(`Tag: ${this.tagName} = ${this.tagValue}`);
    this.tagName = '';
    this.tagValue = '';
  }

  parse(document) {
    this.song = new Song();
    this.tagName = '';
    this.tagValue = '';
    super.parse(document);
    return this.song;
  }
}
