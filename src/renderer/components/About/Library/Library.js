/** ***************************************************************************
 * Copyright © 2018 Monaize Singapore PTE. LTD.                               *
 *                                                                            *
 * See the AUTHORS, and LICENSE files at the top-level directory of this      *
 * distribution for the individual copyright holder information and the       *
 * developer policies on copyright and licensing.                             *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Monaize Singapore PTE. LTD software, including this file may be copied,    *
 * modified, propagated or distributed except according to the terms          *
 * contained in the LICENSE file                                              *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/
import * as _ from 'lodash';

const checker = require('license-checker');
const path = require('path');
const fs = require('fs');
const electron = require('electron');

export default {
  name: 'library',
  data() {
    return {
      licenses: {},
    };
  },
  methods: {
    getUrl(license) {
      if (license.url) {
        return license.url;
      }
      return '';
    },
    openLink: (event) => {
      event.preventDefault();
      const link = event.target.href;
      electron.shell.openExternal(link);
    },
    formatEmail(license) {
      if (license.email) {
        return `(${license.email})`;
      }
      return '';
    },
  },
  computed: {
    isLicensesFilled() {
      return !(_.isEmpty(this.licenses));
    },
  },
  mounted() {
    checker.init({
      start: path.join(__dirname, '../../../../../'),
    }, (err, json) => {
      this.licenses = json;
      _.map(this.licenses, (item) => {
        if (item.licenseFile) {
          fs.readFile(item.licenseFile, 'utf8', (err, data) => {
            if (err) throw err;
            item.licenceString = data;
          });
        }
      });
    });
  },
};
