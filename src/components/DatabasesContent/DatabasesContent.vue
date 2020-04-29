<template>
	<div>
    <el-row>
      <el-col :span="24">
        <div class="grid-content bg-purple-dark">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="newConnection" round>新建连接</el-button>
          <el-button type="warning" size="mini" icon="el-icon-refresh" @click="refreshList" round>刷新列表</el-button>
        </div>
      </el-col>
    </el-row>
    <div id="dataPage" v-loading="loading">
      <el-tree :data="data" id="el-tree" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
      <context-menu class="right-menu"
          :target="contextMenuTarget"
          :show="contextMenuVisible"
          @update:show="(show) => changeContextMenu(show)">
        <a href="javascript:;" @click="createDatabaseOrTable">新建{{this.menuLabel}}</a>
        <a href="javascript:;" @click="deleteDatabaseOrTable">删除{{this.menuLabel}}</a>
        <a href="javascript:;" @click="changeDatabaseOrTable">修改{{this.menuLabel}}</a>
        <a href="javascript:;" @click="showTableData" v-if="this.menuLabel == '表'">查看表数据</a>
        <a href="javascript:;" @click="exdbPortDatabaseOrTable">导出{{this.menuLabel}}</a>
      </context-menu>
    </div>
    <!-- 新建数据库连接对话框-->
    <el-dialog v-loading="new_conn_loading" title="新建数据库连接" :visible.sync="dialogVisible" :before-close="closeDialog" :destroy-on-close="true" :close-on-click-modal="false">
      <el-form :model="dbInfo" :rules="rules">
        <el-form-item label="主机" :label-width="formLabelWidth" prop="dbIp">
          <el-input v-model="dbInfo.dbIp" clearable placeholder="请输入主机地址,如:127.0.0.1" required></el-input>
        </el-form-item>
        <el-form-item label="端口号" :label-width="formLabelWidth" prop="dbPort">
          <el-input v-model="dbInfo.dbPort" clearable placeholder="请输入端口号,如:3306" required></el-input>
        </el-form-item>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="dbUser">
          <el-input v-model="dbInfo.dbUser" clearable placeholder="请输入用户名,如:root"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="dbPasswd">
          <el-input v-model="dbInfo.dbPasswd" clearable placeholder="请输入密码,如:123456" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="testConnection" type="warning" icon="el-icon-help" round>测试连接</el-button>
        <el-button type="primary" @click="confirmConnection">确 定</el-button>
      </div>
  </el-dialog>
  <!-- 新建数据库对话框-->
  <el-dialog v-loading="new_database_loading" width="30%" title="创建数据库" :visible.sync="new_database_visible" :before-close="closeNewDatabaseDialog">
      <el-form :model="newDbInfo" :rules="newDbRules">
        <el-form-item label="数据库名" label-width="100px" prop="dbName">
          <el-input v-model="newDbInfo.dbName" clearable placeholder="请输入数据库名称" required></el-input>
        </el-form-item>
        <el-form-item label="字符集" label-width="100px" prop="charset">
          <el-select v-model="newDbInfo.charset" width="auto" @change="newDbInfo.collate = ' '">
            <el-option v-for="item in charset" :key="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序规则" label-width="100px" prop="collate">
          <el-select v-model="newDbInfo.collate" width="auto">
            <el-option v-for="item in charsetAndCollate[newDbInfo.charset]" :key="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmNewDb">确 定</el-button>
      </div>
  </el-dialog>
  <!-- 修改数据库对话框-->
  <el-dialog v-loading="update_database_loading" width="30%" title="创建数据库" :visible.sync="update_database_visible" :before-close="closeUpdateDatabaseDialog">
      <el-form :model="newDbInfo">
        <el-form-item label="数据库名" label-width="100px" prop="dbName">
          <el-input v-model="newDbInfo.dbName" disabled=""></el-input>
        </el-form-item>
        <el-form-item label="字符集" label-width="100px" prop="charset">
          <el-select v-model="newDbInfo.charset" width="auto" @change="newDbInfo.collate = ' '">
            <el-option v-for="item in charset" :key="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序规则" label-width="100px" prop="collate">
          <el-select v-model="newDbInfo.collate" width="auto">
            <el-option v-for="item in charsetAndCollate[newDbInfo.charset]" :key="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="resetUpdateDb">重 置</el-button>
        <el-button type="warning" @click="confirmUpdateDb">修 改</el-button>
      </div>
  </el-dialog>
  <!-- 修改表对话框-->
  <el-dialog v-loading="modify_table_loading" width="50%" title="修改表" :visible.sync="modify_table_visible" :before-close="closeModifyTableDialog">
    <div style="text-align: left;">
      <el-table
        :data="tableStructure"
        height="500"
        border
        style="width: 100%">
        <el-table-column
          prop="field"
          label="名"
          width="180">
          <template slot-scope="scope">
            <span v-show="editline != scope.$index">{{scope.row.field}}</span>
            <el-input v-show="editline == scope.$index" v-model="editableTableStructure.field" placeholder="请输入内容"></el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          width="180">
          <template slot-scope="scope">
            <span v-show="editline != scope.$index">{{scope.row.type}}</span>
            <el-select v-show="editline == scope.$index" v-model="editableTableStructure.type" filterable placeholder="请选择">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          prop="size"
          label="长度">
          <template slot-scope="scope">
            <span v-show="editline != scope.$index">{{scope.row.size}}</span>
            <el-input type="number" v-show="editline == scope.$index" v-model="editableTableStructure.size" placeholder="请输入内容"></el-input>
          </template>
        </el-table-column>
        <el-table-column
          prop="notnull"
          label="不是null">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.notnull" disabled="true" v-show="editline != scope.$index"></el-checkbox>
            <el-checkbox v-model="editableTableStructure.notnull" v-show="editline == scope.$index"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          prop="key"
          label="主键">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.key" disabled="true" v-show="editline != scope.$index"></el-checkbox>
            <el-checkbox v-model="editableTableStructure.key" v-show="editline == scope.$index"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="200">
          <template slot-scope="scope">
            <el-button type="warning" size="mini" @click="editTableStructure(scope)" v-show="editline != scope.$index">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteTableStructure(scope)" v-show="editline != scope.$index">删除字段</el-button>
            <el-button type="success" size="mini" @click="confirmModifyTable(true, scope)" v-show="editline == scope.$index">保存</el-button>
            <el-button type="danger" size="mini" @click="confirmModifyTable(false, scope)" v-show="editline == scope.$index">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-divider></el-divider>
      <el-button type="success" size="mini" @click="add_table_structure_visible = true">添加字段</el-button>
      <el-form style="text-align: center;" size="small" border :inline="true" label-position="top" :model="editableTableStructure" v-show="add_table_structure_visible">
        <el-form-item label="名">
          <el-input v-model="editableTableStructure.field"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editableTableStructure.type" filterable placeholder="请选择">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="长度">
          <el-input type="number" v-model="editableTableStructure.size"></el-input>
        </el-form-item>
        <el-form-item label="不是null">
          <el-checkbox v-model="editableTableStructure.notnull"></el-checkbox>
        </el-form-item>
        <el-form-item label="主键">
          <el-checkbox v-model="editableTableStructure.key"></el-checkbox>
        </el-form-item>
        <el-form-item label="操作">
          <el-button type="success" size="mini" @click="comfirmAddTableStructure(true)">确认</el-button>
          <el-button type="danger" size="mini" @click="comfirmAddTableStructure(false)">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeModifyTableDialog">关闭</el-button>
    </div>
  </el-dialog>
	</div>
</template>

<script>
  import database_list from '../../api/database_list.js'
  import database from '../../api/database.js'
  import download from '../../api/download.js'
  import global_varibles from '../global_varibles'
	export default {
		name:'DatabasesContent',
		data() {
			return {
        editline : -1,
        charset : [' ',
          'armscii8',
          'ascii',
          'big5',
          'binary',
          'cp850',
          'cp852',
          'cp866',
          'cp932',
          'cp1250',
          'cp1251',
          'cp1256',
          'cp1257',
          'dec8',
          'eucjpms',
          'euckr',
          'gb2312',
          'gb18030',
          'gbk',
          'geostd8',
          'greek',
          'hebrew',
          'hp8',
          'keybcs2',
          'koi8r',
          'koi8u',
          'latin1',
          'latin2',
          'latin5',
          'latin7',
          'macce',
          'macroman',
          'sjis',
          'swe7',
          'tis620',
          'ucs2',
          'utf8',
          'utf8mb4',
          'utf16',
          'utf16le',
          'utf32'],
        dialogVisible : false,
        charsetAndCollate : {
          ' ':[' '],
          'armscii8':[' ', 'armscii8_bin', 'armscii8_general_ci'],
          'ascii':[' ', 'ascii_bin', 'ascii_general_ci'],
          'big5':[' ', 'big5_bin', 'big5_chinese_ci'],
          'binary':[' ', 'binary'],
          'cp850':[' ', 'cp850_bin', 'cp850_general_ci'],
          'cp852':[' ', 'cp852_bin', 'cp852_general_ci'],
          'cp866':[' ', 'cp866_bin', 'cp866_general_ci'],
          'cp932':[' ', 'cp932_bin', 'cp932_japanese_ci'],
          'cp1250':[' ', 'cp1250_bin', 'cp1250_croatian_ci', 'cp1250_czech_cs', 'cp1250_general_ci', 'cp1250_polish_ci'],
          'cp1251':[' ', 'cp1251_bin', 'cp1251_bulgarian_ci', 'cp1251_general_ci', 'cp1251_general_cs', 'cp1251_ukrainian_ci'],
          'cp1256':[' ', 'cp1256_bin', 'cp1256_general_ci'],
          'cp1257':[' ', 'cp1257_bin', 'cp1257_general_ci', 'cp1257_lithuanian_ci'],
          'dec8':[' ', 'dec8_bin', 'dec8_swedish_ci'],
          'eucjpms':[' ', 'eucjpms_bin', 'eucjpms_japanese_ci'],
          'euckr':[' ', 'euckr_bin', 'euckr_korean_ci'],
          'gb2312':[' ', 'gb2312_bin', 'gb2312_chinese_ci'],
          'gb18030':[' ', 'gb18030_bin', 'gb18030_chinese_ci', 'gb18030_unicode_520_ci'],
          'gbk':[' ', 'gbk_bin', 'gbk_chinese_ci'],
          'geostd8':[' ', 'geostd8_bin', 'geostd8_general_ci'],
          'greek':[' ', 'greek_bin', 'greek_general_ci'],
          'hebrew':[' ', 'hebrew_bin', 'hebrew_general_ci'],
          'hp8':[' ', 'hp8_bin', 'hp8_english_ci'],
          'keybcs2':[' ', 'keybcs2_bin', 'keybcs2_general_ci'],
          'koi8r':[' ', 'koi8r_bin', 'koi8r_general_ci'],
          'koi8u':[' ', 'koi8u_bin', 'koi8u_general_ci'],
          'latin1':[' ', 'latin1_bin', 'latin1_danish_ci', 'latin1_general_ci', 'latin1_general_cs', 'latin1_german1_ci', 'latin1_german2_ci', 'latin1_spanish_ci', 'latin1_swedish_ci'],
          'latin2':[' ', 'latin2_bin', 'latin2_croatian_ci', 'latin2_czech_cs', 'latin2_general_ci', 'latin2_hungarian_ci'],
          'latin5':[' ', 'latin5_bin', 'latin5_turkish_ci'],
          'latin7':[' ', 'latin7_bin', 'latin7_estonian_cs', 'latin7_general_ci', 'latin7_general_cs'],
          'macce':[' ', 'macce_bin', 'macce_general_ci'],
          'macroman':[' ', 'macroman_bin', 'macroman_general_ci'],
          'sjis':[' ', 'sjis_bin', 'sjis_japanese_ci'],
          'swe7':[' ', 'swe7_bin', 'swe7_swedish_ci'],
          'tis620':[' ', 'tis620_bin', 'tis620_thai_ci'],
          'ucs2':[' ', 'ucs2_bin', 'ucs2_croatian_ci', 'ucs2_czech_ci', 'ucs2_danish_ci', 'ucs2_esperanto_ci', 'ucs2_estonian_ci', 'ucs2_general_ci', 'ucs2_general_mysql500_ci',
                  'ucs2_german2_ci', 'ucs2_hungarian_ci', 'ucs2_icelandic_ci', 'ucs2_latvian_ci', 'ucs2_lithuanian_ci', 'ucs2_persian_ci', 'ucs2_polish_ci', 'ucs2_roman_ci',
                  'ucs2_romanian_ci', 'ucs2_sinhala_ci', 'ucs2_slovak_ci', 'ucs2_slovenian_ci', 'ucs2_spanish_ci', 'ucs2_spanish2_ci', 'ucs2_swedish_ci', 'ucs2_turkish_ci',
                  'ucs2_unicode_520_ci', 'ucs2_unicode_ci', 'ucs2_vietnamese_ci'],
          'ujis':[' ', 'ujis_bin', 'ujis_japanese_ci'],
          'utf8':[' ', 'utf8_bin', 'utf8_croatian_ci', 'utf8_czech_ci', 'utf8_danish_ci', 'utf8_esperanto_ci', 'utf8_estonian_ci', 'utf8_general_ci', 'utf8_general_mysql500_ci',
                  'utf8_german2_ci', 'utf8_hungarian_ci', 'utf8_icelandic_ci', 'utf8_latvian_ci', 'utf8_lithuanian_ci', 'utf8_persian_ci', 'utf8_polish_ci', 'utf8_roman_ci',
                  'utf8_romanian_ci', 'utf8_sinhala_ci', 'utf8_slovak_ci', 'utf8_slovenian_ci', 'utf8_spanish_ci', 'utf8_spanish2_ci', 'utf8_swedish_ci', 'utf8_turkish_ci',
                  'utf8_unicode_520_ci', 'utf8_unicode_ci', 'utf8_vietnamese_ci'],
          'utf8mb4':[' ', 'utf8mb4_bin', 'utf8mb4_croatian_ci', 'utf8mb4_czech_ci', 'utf8mb4_danish_ci', 'utf8mb4_esperanto_ci', 'utf8mb4_estonian_ci', 'utf8mb4_general_ci',
                    'utf8mb4_german2_ci', 'utf8mb4_hungarian_ci', 'utf8mb4_icelandic_ci', 'utf8mb4_latvian_ci', 'utf8mb4_lithuanian_ci', 'utf8mb4_persian_ci', 'utf8mb4_polish_ci',
                    'utf8mb4_roman_ci', 'utf8mb4_romanian_ci', 'utf8mb4_sinhala_ci', 'utf8mb4_slovak_ci', 'utf8mb4_slovenian_ci', 'utf8mb4_spanish_ci', 'utf8mb4_spanish2_ci',
                    'utf8mb4_swedish_ci', 'utf8mb4_turkish_ci', 'utf8mb4_unicode_520_ci', 'utf8mb4_unicode_ci', 'utf8mb4_vietnamese_ci'],
          'utf16':[' ', 'utf16_bin', 'utf16_croatian_ci', 'utf16_czech_ci', 'utf16_danish_ci', 'utf16_esperanto_ci', 'utf16_estonian_ci', 'utf16_general_ci', 'utf16_german2_ci',
                  'utf16_hungarian_ci', 'utf16_icelandic_ci', 'utf16_latvian_ci',  'utf16_lithuanian_ci', 'utf16_persian_ci', 'utf16_polish_ci', 'utf16_roman_ci', 'utf16_romanian_ci',
                  'utf16_sinhala_ci', 'utf16_slovak_ci', 'utf16_slovenian_ci', 'utf16_spanish_ci', 'utf16_spanish2_ci', 'utf16_swedish_ci', 'utf16_turkish_ci', 'utf16_unicode_520_ci',
                  'utf16_unicode_ci', 'utf16_vietnamese_ci'],
          'utf16le':[' ', 'utf16le_bin', 'utf16le_general_ci'],
          'utf32':[' ', 'utf32_bin', 'utf32_croatian_ci', 'utf32_czech_ci', 'utf32_danish_ci', 'utf32_esperanto_ci', 'utf32_estonian_ci', 'utf32_general_ci', 'utf32_german2_ci',
                  'utf32_hungarian_ci', 'utf32_icelandic_ci', 'utf32_latvian_ci', 'utf32_lithuanian_ci', 'utf32_persian_ci', 'utf32_polish_ci', 'utf32_roman_ci', 'utf32_romanian_ci',
                  'utf32_sinhala_ci', 'utf32_slovak_ci', 'utf32_slovenian_ci', 'utf32_spanish_ci', 'utf32_spanish2_ci', 'utf32_swedish_ci', 'utf32_turkish_ci', 'utf32_unicode_520_ci',
                  'utf32_unicode_ci', 'utf32_vietnamese_ci']
        },
        new_database_visible:false,
        update_database_visible: false,
        modify_table_visible:false,
        add_table_structure_visible: false,
        dbInfo:{
          dbIp:'',
          dbPort:'',
          dbUser:'',
          dbPasswd:''
        },
        newDbInfo:{
          dbName:'',
          charset:' ',
          collate:' '
        },
        oldDbInfo:{
          dbName:'',
          charset:' ',
          collate:' '
        },
        rules:{
          dbIp:[
            { required: true, message: '请输入主机地址', trigger: 'blur' }
          ],
          dbPort:[
            { required: true, message: '请输入端口号', trigger: 'blur' }
          ],
          dbUser:[
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          dbPasswd:[
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        },
        newDbRules:{
          dbName:[
            { required: true, message: '请输入数据库名称', trigger: 'blur' }
          ]
        },
        formLabelWidth : '80px',
        contextMenuTarget: null,
        contextMenuVisible: false,
        nodeData: {},
        parentNodeData: {},
        data: [],
        loading: false,
        new_conn_loading: false,
        new_database_loading: false,
        update_database_loading: false,
        modify_table_loading: false,
        defaultProps: {
          children: 'children',
          label: 'label'
        },
        // 表的字段信息
        tableStructure:[],
        editableTableStructure:{
          field:'',
          type:'',
          size:255,
          notnull:false,
          key:false
        },
        typeOptions:[{
            value:'bigint',
            label:'bigint'
          },{
            value:'binary',
            label:'binary'
          },{
            value:'bit',
            label:'bit'
          },{
            value:'blob',
            label:'blob'
          },{
            value:'char',
            label:'char'
          },{
            value:'date',
            label:'date'
          },{
            value:'datetime',
            label:'datetime'
          },{
            value:'decimal',
            label:'decimal'
          },{
            value:'double',
            label:'double'
          },{
            value:'enum',
            label:'enum'
          },{
            value:'float',
            label:'float'
          },{
            value:'geometry',
            label:'geometry'
          },{
            value:'geometrycollection',
            label:'geometrycollection'
          },{
            value:'int',
            label:'int'
          },{
            value:'integer',
            label:'integer'
          },{
            value:'json',
            label:'json'
          },{
            value:'linestring',
            label:'linestring'
          },{
            value:'longblob',
            label:'longblob'
          },{
            value:'longtext',
            label:'longtext'
          },{
            value:'mediumblob',
            label:'mediumblob'
          },{
            value:'mediumint',
            label:'mediumint'
          },{
            value:'mediumtext',
            label:'mediumtext'
          },{
            value:'multilinestring',
            label:'multilinestring'
          },{
            value:'multipoint',
            label:'multipoint'
          },{
            value:'multipolygon',
            label:'multipolygon'
          },{
            value:'numeric',
            label:'numeric'
          },{
            value:'point',
            label:'point'
          },{
            value:'polygon',
            label:'polygon'
          },{
            value:'real',
            label:'real'
          },{
            value:'set',
            label:'set'
          },{
            value:'smallint',
            label:'samllint'
          },{
            value:'text',
            label:'text'
          },{
            value:'time',
            label:'time'
          },{
            value:'timestamp',
            label:'timestamp'
          },{
            value:'tinyblob',
            label:'tinyblob'
          },{
            value:'tinyint',
            label:'tinyint'
          },{
            value:'tinytext',
            label:'tinytext'
          },{
            value:'varbinary',
            label:'varbinary'
          },{
            value:'varchar',
            label:'varchar'
          },{
            value:'year',
            label:'year'
          }
        ],
			};
	},
    methods: {
      // 新建数据库连接
      newConnection() {
        this.dialogVisible = true;
      },
      // 确定新建数据库
      confirmNewDb() {
        this.new_database_loading = true;
        database.create_db({
          dbName:this.newDbInfo.dbName,
          charset:this.newDbInfo.charset,
          collate:this.newDbInfo.collate,
          dataSource:global_varibles.dataSource
        }).then(result => {
          this.newDbInfo = {dbName:'',charset:' ',collate:' '};
          this.new_database_visible = false;
          this.new_database_loading = false;
          if(result.meta.success) {
            this.$message({
              message:'创建数据库成功！',
              type:'success'
            })
            this.refreshList()
          } else {
            this.new_database_visible = false;
            this.$message({
              message:result.meta.message,
              type:'error'
            })
          }
        }).catch(result => {
          this.new_database_visible = false;
          this.new_database_loading = false;
          this.$message({
            message:'创建数据库失败！',
            type:'error'
          })
        })
      },
      // 确定修改数据库
      confirmUpdateDb() {
        this.update_database_loading = true;
        if(this.oldDbInfo.charset == this.newDbInfo.charset && this.oldDbInfo.collate == this.newDbInfo.collate) {
          this.update_database_loading = false;
          this.$message({
            message:'未作任何修改！',
            type:'info'
          });
        } else {
          database.update_database_charset_and_collation({
            dataSource : global_varibles.dataSource,
            dbName : this.nodeData.label,
            newCharset : this.newDbInfo.charset,
            oldCharset : this.oldDbInfo.charset,
            newCollation : this.newDbInfo.collate,
            oldCollation : this.oldDbInfo.collate
          }).then(result => {
            if(result.meta.success) {
              this.update_database_visible = false;
              this.closeUpdateDatabaseDialog();
              this.update_database_loading = false;
              this.$message({
                message: '修改成功！',
                type: 'success'
              });
            } else {
              this.$message({
                message: result.meta.message,
                type: 'error'
              });
              this.update_database_loading = false;
            }
          }).catch(result => {
            alert(result);
            this.update_database_loading = false;
          })
        }
      },
      // 重置修改数据库信息
      resetUpdateDb() {
        this.newDbInfo.charset = this.oldDbInfo.charset;
        this.newDbInfo.collate = this.oldDbInfo.collate;
      },
      // 刷新数据库列表
      refreshList() {
        this.loading = true;
        database_list.test_conn(this.dbInfo)
        .then(result => {
          if(result.meta.success) {
            global_varibles.dataSource = result.meta.dataSource;
            database_list.get_databases_and_tables({
              dataSource:global_varibles.dataSource
            })
            .then(result => {
              if(result.meta.success) {
                global_varibles.dataSource = result.meta.dataSource;
                this.data = result.data.result;
                this.dialogVisible = false;
                this.loading = false;
                this.$message({
                  message: '刷新成功！',
                  type: 'success'
                })
              } else {
                this.loading = false;
                this.$message({
                  message: result.meta.message,
                  type: 'error'
                });
              }
            }).catch(result => {
              this.loading = false;
              alert(result)
            })
          } else {
            this.loading = false;
            this.$message({
              message: result.meta.message,
              type: 'error'
            });
          }
        }).catch(result => {
          this.loading = false;
          alert(result)
        })
      },
      // 测试数据库连接
      testConnection () {
        database_list.test_conn(this.dbInfo)
        .then(result => {
          if(result.meta.success) {
            global_varibles.testDataSource = result.meta.dataSource;
            global_varibles.dataSource = result.meta.dataSource;
            this.$message({
              message: '连接成功！',
              type: 'success'
            })
          } else {
            this.$message({
              message: result.meta.message,
              type: 'error'
            });
          }
        }).catch(result => {
          alert(result)
        })
      },
      // 确定连接
      confirmConnection() {
        this.new_conn_loading = true;
        database_list.test_conn(this.dbInfo)
        .then(result => {
          if(result.meta.success) {
            global_varibles.dataSource = result.meta.dataSource;
            database_list.get_databases_and_tables({
              dataSource:global_varibles.dataSource
            })
            .then(result => {
              if(result.meta.success) {
                global_varibles.dataSource = result.meta.dataSource;
                this.data = result.data.result;
                this.dialogVisible = false;
                this.new_conn_loading = false;
                this.$message({
                  message: '连接成功！',
                  type: 'success'
                })
              } else {
                this.new_conn_loading = false;
                this.$message({
                  message: result.meta.message,
                  type: 'error'
                });
              }
            }).catch(result => {
              this.new_conn_loading = false;
              alert(result)
            })
          } else {
            this.new_conn_loading = false;
            this.$message({
              message: result.meta.message,
              type: 'error'
            });
          }
        }).catch(result => {
          this.new_conn_loading = false;
          alert(result)
        })
      },
      // 关闭Dialog前回调
      closeDialog() {
        this.dbInfo = {
          dbIp:'',
          dbPort:'',
          dbUser:'',
          dbPasswd:''
        };
        this.dialogVisible = false;
      },
      // 关闭新建数据库Dialog前回调
      closeNewDatabaseDialog(){
        this.new_database_visible = false;
      },
      // 关闭修改数据库Dialog前回调
      closeUpdateDatabaseDialog(){
        this.update_database_visible = false;
        this.newDbInfo = {
          dbName:'',
          charset:' ',
          collate:' '
        };
        this.oldDbInfo = {
          dbName:'',
          charset:' ',
          collate:' '
        };
      },
      // 关闭修改表Dialog前回调
      closeModifyTableDialog(){
        this.add_table_structure_visible = false;
        this.modify_table_visible = false;
        this.editableTableStructure = {
            field:'',
            type:'',
            size:255,
            notnull:false,
            key:false
          };
        this.editline = -1;
      },
      // 左击数据库
      handleNodeClick(data, node) {
        // console.log(data)
        this.nodeData = data;
        this.parentNodeData = node.parent;
      },
      // 右击列表
      changeContextMenu(show) {
        this.contextMenuVisible = show;
        event.target.click();
      },
      createDatabaseOrTable() {
        this.contextMenuVisible = false;
        this.new_database_visible = true;
      },
      // 删除数据库/表
      deleteDatabaseOrTable() {
        this.contextMenuVisible = false;
        this.$confirm('此操作将删除' + this.nodeData.label + this.menuLabel + ', 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if(this.menuLabel == '数据库') {
            database.drop_db({
              dataSource:global_varibles.dataSource,
              dbName:this.nodeData.label
            }).then(result => {
              if(result.meta.success) {
                this.$message({
                  message:'删除数据库成功！',
                  type:'success'
                });
                this.refreshList();
              } else {
                this.$message({
                  message:result.meta.message,
                  type:'error'
                });
              }
            }).catch(result => {
              alert(result);
            })
          } else if(this.menuLabel == '表') {
            database.drop_tb({
              dataSource:global_varibles.dataSource,
              tbName:this.nodeData.label,
              dbName:this.parentNodeData.label
            }).then(result => {
              if(result.meta.success) {
                this.$message({
                  message:'删除表成功！',
                  type:'success'
                });
                this.refreshList();
              } else {
                this.$message({
                  message:result.meta.message,
                  type:'error'
                });
              }
            }).catch(result => {
              alert(result);
            })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      // 修改数据库/表
      changeDatabaseOrTable() {
        this.contextMenuVisible = false;
        if('数据库' == this.menuLabel) {
          database.get_database_charset_and_collation({
            dbName: this.nodeData.label,
            dataSource: global_varibles.dataSource
          }).then(result => {
            if(result.meta.success) {
              this.oldDbInfo.dbName = this.nodeData.label;
              this.oldDbInfo.charset = result.data.charset;
              this.oldDbInfo.collate = result.data.collation;
              this.newDbInfo.dbName = this.nodeData.label;
              this.newDbInfo.charset = result.data.charset;
              this.newDbInfo.collate = result.data.collation;
              this.update_database_visible = true;
            } else {
              this.$message({
                message:result.meta.message,
                type:'error'
              })
            }
          }).catch(result => {
            alert(result);
          })
        } else {
          // 修改表
          this.modify_table_visible = true;
          database.table_structure({
            dataSource: global_varibles.dataSource,
            tbName:this.nodeData.label,
            dbName:this.parentNodeData.label
          }).then(result => {
            if(result.meta.success) {
              this.tableStructure = result.data;
            } else {
              this.$message({
                message:result.meta.message,
                type:'error'
              });
            }
          }).catch(result => {
            console.log(result);
          })
        }
      },
      // 保存修改表
      confirmModifyTable(flag, scope) {
        this.modify_table_loading = true;
        if(flag) {
          if(scope.row.field == this.editableTableStructure.field &&
            scope.row.type == this.editableTableStructure.type &&
            scope.row.size == this.editableTableStructure.size &&
            scope.row.notnull == this.editableTableStructure.notnull &&
            scope.row.key == this.editableTableStructure.key) {
              // 未修改
              this.editableTableStructure = {
                field:'',
                type:'',
                size:255,
                notnull:false,
                key:false
              };
              this.modify_table_loading = false;
              this.$message({
                message:'未做任何修改！',
                type:'warning'
              });
            } else {
              database.modify_column({
                oldTableStructureVo: scope.row,
                newTableStructureVo: this.editableTableStructure,
                dbName: this.parentNodeData.label,
                tbName: this.nodeData.label,
                dataSource: global_varibles.dataSource
              }).then(result => {
                if(result.meta.success) {
                  this.editableTableStructure = {
                    field:'',
                    type:'',
                    size:255,
                    notnull:false,
                    key:false
                  };
                  this.tableStructure = result.data;
                  this.modify_table_loading = false;
                  this.$message({
                    message: '修改字段成功！',
                    type:'success'
                  });
                } else {
                  console.log(this.editableTableStructure)
                  this.editableTableStructure = {
                    field:'',
                    type:'',
                    size:255,
                    notnull:false,
                    key:false
                  };
                  this.modify_table_loading = false;
                  this.$message({
                    message: result.meta.message,
                    type:'error'
                  });
                }
              }).catch(result => {
                alert(result);
              })
            }
        } else {
          this.modify_table_loading = false;
          this.editableTableStructure = {
            field:'',
            type:'',
            size:255,
            notnull:false,
            key:false
          };
        }
        this.editline = -1;
        this.modify_table_loading = false;
      },
      // 修改表
      editTableStructure(scope) {
        this.editline = scope.$index;
        this.editableTableStructure = JSON.parse(JSON.stringify(scope.row));
      },
      // 删除字段
      deleteTableStructure(scope) {
        this.$confirm('此操作将删除字段 ' + scope.row.field + ' ,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          database.drop_column({
            dbName: this.parentNodeData.label,
            tbName: this.nodeData.label,
            columnName: scope.row.field,
            dataSource: global_varibles.dataSource
          }).then(result => {
            if(result.meta.success) {
              this.tableStructure = result.data;
              this.$message({
                message:'删除字段成功！',
                type:"success"
              })
            } else {
              this.$message({
                message: result.meta.message,
                type:"error"
              })
            }
          }).catch(result => {
            alert(result);
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        })
      },
      // 确认添加字段
      comfirmAddTableStructure(flag) {
        if(flag) {
          database.add_column({
            tableStructureVo: this.editableTableStructure,
            dbName: this.parentNodeData.label,
            tbName: this.nodeData.label,
            dataSource: global_varibles.dataSource
          }).then(result => {
            // console.log(result);
            if(result.meta.success) {
              this.add_table_structure_visible = false;
              this.editableTableStructure = {
                field:'',
                type:'',
                size:255,
                notnull:false,
                key:false
              };
              this.tableStructure = result.data;
              this.$message({
                message:'添加字段成功！',
                type:'success'
              })
            } else {
              this.$message({
                message:'result.meta.message',
                type:'error'
              })
            }
          }).catch(result => {
            alert(result);
          })
        } else {
          this.add_table_structure_visible = false;
          this.editableTableStructure = {
            field:'',
            type:'',
            size:255,
            notnull:false,
            key:false
          };
        }

      },
      // 导出数据库/表
      exdbPortDatabaseOrTable() {
        this.contextMenuVisible = false;
        // 导出数据库
        if('数据库' == this.menuLabel) {
          this.$prompt('请输入文件名', '导出数据库', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^(.)+$/,
            inputErrorMessage: '文件名不能为空',
            inputValue: this.nodeData.label
          }).then(({ value }) => {
            this.$message({
              type: 'success',
              message: '保存为: ' + value + '.sql'
            });
            database.export_db({
              dbName : this.nodeData.label,
              fileName : value,
              dataSource : global_varibles.dataSource
            }).then(result => {
              if(result.meta.success) {
                download.download({
                  fileName : result.data
                }).then(result => {
                  this.downloadSQLFile(result, value);
                }).catch(result => {
                  alert(result);
                })
              } else {
                this.$message({
                  message:result.meta.message,
                  type:'error'
                });
              }
            }).catch(result => {
              alert(result);
            })

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消输入'
            });
          });
        } else {
          // 导出表
          this.$prompt('请输入文件名', '导出表', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^(.)+$/,
            inputErrorMessage: '文件名不能为空',
            inputValue: this.nodeData.label
          }).then(({ value }) => {
            this.$message({
              type: 'success',
              message: '保存为: ' + value + '.sql'
            });
            database.export_table({
              dbName : this.parentNodeData.label,
              tbName : this.nodeData.label,
              fileName : value,
              dataSource : global_varibles.dataSource
            }).then(result => {
              if(result.meta.success) {
                download.download({
                  fileName : result.data
                }).then(result => {
                  this.downloadSQLFile(result, value);
                }).catch(result => {
                  alert(result);
                })
              } else {
                this.$message({
                  message:result.meta.message,
                  type:'error'
                });
              }
            }).catch(result => {
              alert(result);
            })

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消输入'
            });
          });
        }
        // console.log("exdbPort " + this.nodeData.label + this.menuLabel);
      },
      downloadSQLFile(data, fileName) {
        //定义文件内容，类型必须为Blob 否则createObjectURL会报错
        // 不需要再将data进行stringfy了！！！
        let content = new Blob([data])

        //生成url对象
        let urlObject = window.URL || window.webkitURL || window
        let url = urlObject.createObjectURL(content)
        //生成<a></a>DOM元素
        let el = document.createElement('a')
        //链接赋值
        el.href = url
        el.download = fileName + '.sql'
        //必须点击否则不会下载
        el.click()
        //移除链接释放资源
        urlObject.revokeObjectURL(url)
      },
      // 查看表数据
      showTableData(){
        this.contextMenuVisible = false;
        this.$store.commit("setDbName", this.parentNodeData.label);
        this.$store.commit("setTbName", this.nodeData.label);
        this.$store.commit("setCurrentPage", 1);
        this.$store.commit("setSearchFlag", true);
      }
    },
    mounted() {
      this.$nextTick(() => {
        // vue-context-menu 需要传入一个触发右键事件的元素，等页面 dom 渲染完毕后才可获取
        this.contextMenuTarget = document.querySelector('#el-tree')
        // 获取所有的 treeitem，循环监听右键事件
        const tree = document.querySelectorAll('#el-tree [role="treeitem"]')
        tree.forEach(i => {
          i.addEventListener('contextmenu',event => {
            // 如果右键了，则模拟点击这个treeitem
            event.target.click();
          })
        })
      })
    },
    computed: {
      menuLabel() {
        if(this.nodeData.label == null) {
          return '数据库';
        } else {
          return this.nodeData.children == null ? '表' : '数据库';
        }
      },
      searchFlag() {
        return this.$store.state.searchFlag;
      },
      searchDbName() {
        return this.$store.state.dbName;
      },
      searchTbName() {
        return this.$store.state.tbName;
      },
      searchPage() {
        return this.$store.state.currentPage;
      }
    },
    watch: {
      searchFlag(val) {
        if(val) {
          database.show_table_data({
            dbName: this.searchDbName,
            tbName: this.searchTbName,
            pageNum: this.searchPage,
            pageSize: 10,
            ordField: "",
            sort: false,
            dataSource: global_varibles.dataSource
          }).then(result => {
            if(result.meta.success) {
              this.$store.commit('setTableData', result.data.data);
              this.$store.commit('setColumns', result.data.columns);
              this.$store.commit('setTotal', result.data.total);
              this.$message({
                message: '查询数据成功！',
                type: 'success'
              })
            } else {
              this.$message({
                message: result.meta.message,
                type: 'error'
              })
            }
          }).catch(result => {
            alert(result);
          });
          this.$store.commit('setSearchFlag', false);
        }
      }
    }
  };
</script>

<style>
  .el-row {
    margin-top: 2px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .bg-purple-dark {
    background: #99a9bf;
    /* background: #E9EEF3; */
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .el-col {
    border-radius: 4px;
  }
  .el-button {
    margin-top: 4px;
    margin-left: 8px;
  }
  html,
  body {
    height: 100%;
  }
  #dataPage {
    margin: 0 0;
    font-family: 'Microsoft Yahei', 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
  }
  // 右键会选中文字，为了美观将它禁用
  #el-tree{
    user-select:none;
  }
  .right-menu {
    font-size: 14px;
    position: fixed;
    background: #fff;
    border: solid 1px rgba(0, 0, 0, .2);
    border-radius: 3px;
    z-index: 999;
    display: none;
  }
  .right-menu a {
    width: 150px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    display: block;
    color: #1a1a1a;
  }
  .right-menu a:hover {
    background: #eee;
    color: #fff;
  }
  .right-menu {
      border: 1px solid #eee;
      box-shadow: 0 0.5em 1em 0 rgba(0,0,0,.1);
      border-radius: 1px;
  }
  a {
      text-decoration: none;
  }
  .right-menu a {
      padding: 2px;
  }
  .right-menu a:hover {
      background: #99A9BF;
  }
  .el-tree-node__expand-icon{
    color: #99A9BF;
  }
  .el-tree-node__content:hover .el-tree-node__expand-icon{
    color: #FFFFFF;
  }
  .el-tree-node__content:hover .el-tree-node__expand-icon.is-leaf{
    color: transparent
  }
  .el-tree-node__content:hover{
    background-color: #99A9BF;
    color: #FFFFFF;
  }
  .el-tree-node:focus>.el-tree-node__content{
    background-color: #99A9BF;
    color: #FFFFFF;
  }
</style>
